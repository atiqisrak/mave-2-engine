import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  /**
   * Check if mailing service is enabled
   */
  private isMailingServiceEnabled(): boolean {
    const mailingService = this.configService.get<string>('MAILING_SERVICE', 'enabled');
    return mailingService.toLowerCase() === 'enabled';
  }

  /**
   * Log that email sending was skipped due to disabled mailing service
   */
  private logSkippedEmail(emailType: string, to: string): void {
    this.logger.log(
      `Email sending skipped - Mailing service disabled. Type: ${emailType}, To: ${to}`,
    );
  }

  async sendWelcomeEmail(to: string, firstName: string) {
    if (!this.isMailingServiceEnabled()) {
      this.logSkippedEmail('Welcome Email', to);
      return;
    }

    await this.mailerService.sendMail({
      to,
      subject: 'Welcome to Mave CMS!',
      template: 'welcome',
      context: {
        firstName,
        appName: 'Mave CMS',
      },
    });
  }

  async sendEmailVerification(to: string, firstName: string, verificationToken: string) {
    if (!this.isMailingServiceEnabled()) {
      this.logSkippedEmail('Email Verification', to);
      return;
    }

    const verificationUrl = `${this.configService.get('APP_URL')}/verify-email?token=${verificationToken}`;

    await this.mailerService.sendMail({
      to,
      subject: 'Verify your email address',
      template: 'email-verification',
      context: {
        firstName,
        verificationUrl,
        appName: 'Mave CMS',
      },
    });
  }

  async sendPasswordResetEmail(to: string, firstName: string, resetToken: string) {
    if (!this.isMailingServiceEnabled()) {
      this.logSkippedEmail('Password Reset', to);
      return;
    }

    const resetUrl = `${this.configService.get('APP_URL')}/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to,
      subject: 'Reset your password',
      template: 'password-reset',
      context: {
        firstName,
        resetUrl,
        appName: 'Mave CMS',
        expiresIn: '1 hour',
      },
    });
  }

  async send2FAEnabledNotification(to: string, firstName: string) {
    if (!this.isMailingServiceEnabled()) {
      this.logSkippedEmail('2FA Enabled Notification', to);
      return;
    }

    await this.mailerService.sendMail({
      to,
      subject: '2FA Enabled on Your Account',
      template: '2fa-enabled',
      context: {
        firstName,
        appName: 'Mave CMS',
        enabledAt: new Date().toLocaleString(),
      },
    });
  }

  async send2FADisabledNotification(to: string, firstName: string) {
    if (!this.isMailingServiceEnabled()) {
      this.logSkippedEmail('2FA Disabled Notification', to);
      return;
    }

    await this.mailerService.sendMail({
      to,
      subject: '2FA Disabled on Your Account',
      template: '2fa-disabled',
      context: {
        firstName,
        appName: 'Mave CMS',
        disabledAt: new Date().toLocaleString(),
      },
    });
  }

  async sendNewLoginNotification(
    to: string,
    firstName: string,
    ipAddress: string,
    timestamp: Date,
  ) {
    if (!this.isMailingServiceEnabled()) {
      this.logSkippedEmail('New Login Notification', to);
      return;
    }

    try {
      console.log(`Attempting to send new login notification to: ${to}`);
      console.log(`SMTP Host: ${this.configService.get('SMTP_HOST')}`);
      console.log(`SMTP Port: ${this.configService.get('SMTP_PORT')}`);

      await this.mailerService.sendMail({
        to,
        subject: 'New Login to Your Account',
        template: 'new-login',
        context: {
          firstName,
          appName: 'Mave CMS',
          ipAddress,
          timestamp: timestamp.toLocaleString(),
        },
      });

      console.log(`New login notification sent successfully to: ${to}`);
    } catch (error) {
      console.error('Failed to send new login email:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
      });
      throw error;
    }
  }

  async sendPasswordChangedNotification(to: string, firstName: string) {
    if (!this.isMailingServiceEnabled()) {
      this.logSkippedEmail('Password Changed Notification', to);
      return;
    }

    await this.mailerService.sendMail({
      to,
      subject: 'Your Password Has Been Changed',
      template: 'password-changed',
      context: {
        firstName,
        appName: 'Mave CMS',
        changedAt: new Date().toLocaleString(),
      },
    });
  }

  async sendTestEmail(to: string) {
    if (!this.isMailingServiceEnabled()) {
      this.logSkippedEmail('Test Email', to);
      return;
    }

    await this.mailerService.sendMail({
      to,
      subject: 'Mave CMS - Test Email',
      template: 'test-email',
      context: {
        appName: 'Mave CMS',
        sentAt: new Date().toLocaleString(),
      },
    });
  }
}
