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
        'RESEND_API_KEY not found. Email functionality will be simulated (logged to console).',
      );
    } else {
      this.resend = new Resend(apiKey);
    }
    this.emailFrom =
      this.configService.get<string>('EMAIL_FROM') ||
      'Sentinel AI <onboarding@resend.dev>';
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.log(`[SIMULATED EMAIL] To: ${to}, Subject: ${subject}`);
      this.logger.log(`[SIMULATED EMAIL BODY]: ${html}`);
      return;
    }

    try {
      const response = await this.resend.emails.send({
        from: this.emailFrom,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}. ID: ${response.data?.id}`);
      if (response.error) {
        this.logger.error(
          `Resend API Error: ${JSON.stringify(response.error)}`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      throw error;
    }
  }

  async sendVerificationEmail(
    email: string,
    verificationToken: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationLink = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;

    const { subject, html } = verifyEmailTemplate(verificationLink, email);
    await this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    const { subject, html } = resetPasswordTemplate(resetLink, email);
    await this.sendEmail(email, subject, html);
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
    // Don't throw - login notification failure shouldn't block the login
    try {
      await this.sendEmail(email, subject, html);
    } catch (error) {
      this.logger.error(
        `Failed to send login notification to ${email}`,
        error.stack,
      );
    }
  }

  async sendPasswordChangedEmail(email: string): Promise<void> {
    const { subject, html } = passwordChangedTemplate(email);
    // Don't throw - confirmation email failure shouldn't block the password change
    try {
      await this.sendEmail(email, subject, html);
    } catch (error) {
      this.logger.error(
        `Failed to send password changed email to ${email}`,
        error.stack,
      );
    }
  }
}
