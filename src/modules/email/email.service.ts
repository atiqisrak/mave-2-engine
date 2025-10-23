import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendWelcomeEmail(to: string, firstName: string) {
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

  async sendEmailVerification(
    to: string,
    firstName: string,
    verificationToken: string,
  ) {
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

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetToken: string,
  ) {
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

