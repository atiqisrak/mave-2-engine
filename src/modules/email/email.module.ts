import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmailService } from './email.service';
import { EmailResolver } from './email.resolver';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mailingService = configService.get<string>('MAILING_SERVICE', 'enabled');

        // If mailing service is disabled, return a minimal configuration
        if (mailingService.toLowerCase() !== 'enabled') {
          console.log('Mailing service is disabled - using mock configuration');
          return {
            transport: {
              host: 'localhost',
              port: 1025,
              secure: false,
              ignoreTLS: true,
              auth: false,
            },
            defaults: {
              from: 'noreply@mave-cms.local',
            },
            template: {
              dir: join(process.cwd(), 'src/modules/email/templates'),
              adapter: new HandlebarsAdapter(),
              options: {
                strict: false,
              },
            },
          };
        }

        const smtpUser = configService.get('SMTP_USER');
        const smtpPass = configService.get('SMTP_PASS');
        const smtpHost = configService.get('SMTP_HOST', 'localhost');
        const smtpPort = parseInt(configService.get('SMTP_PORT', '1025'));

        console.log('Email configuration:', {
          host: smtpHost,
          port: smtpPort,
          user: smtpUser ? '***' : 'not set',
          hasPassword: !!smtpPass,
        });

        // Configure transport based on host
        const isLocalhost = smtpHost === 'localhost' || smtpHost === '127.0.0.1';

        const transportConfig: any = {
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // true for 465, false for other ports
          connectionTimeout: 60000, // 60 seconds
          greetingTimeout: 30000, // 30 seconds
          socketTimeout: 60000, // 60 seconds
        };

        // For localhost (Mailpit), ignore TLS
        if (isLocalhost) {
          transportConfig.ignoreTLS = true;
          transportConfig.tls = {
            rejectUnauthorized: false,
          };
        } else {
          // For external SMTP (Gmail, SendGrid, etc.), require TLS
          transportConfig.requireTLS = true;
          transportConfig.tls = {
            rejectUnauthorized: false, // Set to false for Gmail to avoid certificate issues
          };
          // Add debug logging for SMTP connections
          transportConfig.debug = true;
          transportConfig.logger = true;
        }

        // Only add auth if credentials are actually provided and not empty
        if (smtpUser && smtpPass && smtpUser.trim() !== '' && smtpPass.trim() !== '') {
          transportConfig.auth = {
            user: smtpUser,
            pass: smtpPass,
          };
        }

        // Add additional configuration for Gmail
        if (smtpHost === 'smtp.gmail.com') {
          transportConfig.service = 'gmail';
          transportConfig.pool = true;
          transportConfig.maxConnections = 5;
          transportConfig.maxMessages = 100;
          transportConfig.rateDelta = 20000;
          transportConfig.rateLimit = 5;
        }

        return {
          transport: transportConfig,
          defaults: {
            from: configService.get('SMTP_FROM', 'noreply@mave-cms.local'),
          },
          template: {
            dir: join(process.cwd(), 'src/modules/email/templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: false,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService, EmailResolver],
  exports: [EmailService],
})
export class EmailModule {}
