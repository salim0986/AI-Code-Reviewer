import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { EmailService } from '../email/email.service';
import { SessionsService } from '../sessions/sessions.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, gt } from 'drizzle-orm';
import {
  users,
  emailVerificationTokens,
  passwordResetTokens,
  refreshTokens,
  NewUser,
} from '../database/schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private sessionsService: SessionsService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password } = registerDto;

    // Check if user already exists
    const [existingUser] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await this.databaseService.db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        isVerified: false,
      } as NewUser)
      .returning();

    // Generate verification token
    const verificationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await this.databaseService.db.insert(emailVerificationTokens).values({
      userId: newUser.id,
      token: verificationToken,
      expiresAt,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(email, verificationToken);

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const [verificationRecord] = await this.databaseService.db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, token),
          gt(emailVerificationTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!verificationRecord) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Update user as verified
    await this.databaseService.db
      .update(users)
      .set({ isVerified: true, updatedAt: new Date() })
      .where(eq(users.id, verificationRecord.userId));

    // Delete verification token
    await this.databaseService.db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, verificationRecord.id));

    return { message: 'Email verified successfully. You can now login.' };
  }

  async login(
    loginDto: LoginDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; isVerified: boolean };
  }> {
    const { email, password } = loginDto;

    // Find user
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    // Check for unusual login and send notification
    await this.sessionsService.trackLogin(user.id, ipAddress, userAgent, email);

    // Update last login
    await this.databaseService.db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Store refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

    await this.databaseService.db.insert(refreshTokens).values({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: refreshTokenExpiry,
      ipAddress,
      userAgent,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
      },
    };
  }

  async refreshAccessToken(oldRefreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Verify refresh token exists and is valid
    const [tokenRecord] = await this.databaseService.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, oldRefreshToken),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Get user
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, tokenRecord.userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Delete old refresh token
    await this.databaseService.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.id, tokenRecord.id));

    // Store new refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await this.databaseService.db.insert(refreshTokens).values({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: refreshTokenExpiry,
      ipAddress: tokenRecord.ipAddress,
      userAgent: tokenRecord.userAgent,
    });

    return tokens;
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    if (refreshToken) {
      await this.databaseService.db
        .delete(refreshTokens)
        .where(eq(refreshTokens.token, refreshToken));
    }

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

    // Delete any existing reset tokens for this user
    await this.databaseService.db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id));

    // Create new reset token
    await this.databaseService.db.insert(passwordResetTokens).values({
      userId: user.id,
      token: resetToken,
      expiresAt,
    });

    // Send reset email
    await this.emailService.sendPasswordResetEmail(email, resetToken);

    return {
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // Find valid reset token
    const [resetRecord] = await this.databaseService.db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!resetRecord) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Get user
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, resetRecord.userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.databaseService.db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // Delete reset token
    await this.databaseService.db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, resetRecord.id));

    // Revoke all refresh tokens (log out from all devices)
    await this.databaseService.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.userId, user.id));

    // Send confirmation email
    await this.emailService.sendPasswordChangedEmail(user.email);

    return { message: 'Password reset successfully. Please login again.' };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Get user
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if new password is different
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.databaseService.db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // Revoke all refresh tokens (log out from all devices)
    await this.databaseService.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.userId, user.id));

    // Send confirmation email
    await this.emailService.sendPasswordChangedEmail(user.email);

    return {
      message: 'Password changed successfully. Please login again.',
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email };

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
