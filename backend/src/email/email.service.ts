import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { verifyEmailTemplate } from './templates/verify-email.template';
import { resetPasswordTemplate } from './templates/reset-password.template';
import { loginNotificationTemplate } from './templates/login-notification.template';
import { passwordChangedTemplate } from './templates/password-changed.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private emailFrom: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not found. Email functionality will be disabled.',
      );
    } else {
      this.resend = new Resend(apiKey);
    }
    this.emailFrom =
      this.configService.get<string>('EMAIL_FROM') ||
      'Sentinel AI <onboarding@resend.dev>';
  }

  async sendVerificationEmail(
    email: string,
    verificationToken: string,
  ): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL');
    const verificationLink = `${appUrl}/auth/verify-email?token=${verificationToken}`;

    const { subject, html } = verifyEmailTemplate(verificationLink, email);

    try {
      await this.resend.emails.send({
        from: this.emailFrom,
        to: email,
        subject,
        html,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const { subject, html } = resetPasswordTemplate(resetLink, email);

    try {
      await this.resend.emails.send({
        from: this.emailFrom,
        to: email,
        subject,
        html,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendLoginNotification(
    email: string,
    loginDetails: {
      ipAddress: string;
      userAgent: string;
      timestamp: Date;
    },
  ): Promise<void> {
    const { subject, html } = loginNotificationTemplate(email, loginDetails);

    try {
      await this.resend.emails.send({
        from: this.emailFrom,
        to: email,
        subject,
        html,
      });
      this.logger.log(`Login notification sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send login notification to ${email}`,
        error.stack,
      );
      // Don't throw - login notification failure shouldn't block the login
    }
  }

  async sendPasswordChangedEmail(email: string): Promise<void> {
    const { subject, html } = passwordChangedTemplate(email);

    try {
      await this.resend.emails.send({
        from: this.emailFrom,
        to: email,
        subject,
        html,
      });
      this.logger.log(`Password changed confirmation sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password changed email to ${email}`,
        error.stack,
      );
      // Don't throw - confirmation email failure shouldn't block the password change
    }
  }
}
