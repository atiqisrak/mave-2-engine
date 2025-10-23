import { Injectable, BadRequestException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as argon2 from 'argon2';
import { PrismaService } from '../../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../email/email.service';

@Injectable()
export class TwoFactorService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  /**
   * Generate TOTP secret for user
   */
  async generateSecret(userId: string, userEmail: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new BadRequestException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled for this user');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Mave CMS (${userEmail})`,
      issuer: 'Mave CMS',
      length: 32,
    });

    // Store secret temporarily (not yet enabled)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32,
      },
    });

    // Generate QR code
    const otpauthUrl = secret.otpauth_url!;
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    return {
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      otpauthUrl,
    };
  }

  /**
   * Verify TOTP token and enable 2FA
   */
  async verifyAndEnable(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new BadRequestException('User not found');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException('2FA secret not found. Please generate a secret first');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    // Verify token
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after for clock skew
    });

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Generate backup codes
    const backupCodes = await this.generateBackupCodes();
    const hashedBackupCodes = await Promise.all(backupCodes.map((code) => argon2.hash(code)));

    // Enable 2FA
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: hashedBackupCodes,
      },
    });

    // Send notification email
    try {
      await this.emailService.send2FAEnabledNotification(
        updatedUser.email,
        updatedUser.firstName || 'User',
      );
    } catch (error) {
      console.error('Failed to send 2FA enabled email:', error);
    }

    return {
      enabled: true,
      backupCodes, // Return plain codes only once
    };
  }

  /**
   * Verify TOTP token for login
   */
  async verifyToken(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    // Verify TOTP token
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    return isValid;
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, backupCode: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt || !user.twoFactorEnabled) {
      return false;
    }

    // Check each hashed backup code
    for (let i = 0; i < user.twoFactorBackupCodes.length; i++) {
      const isValid = await argon2.verify(user.twoFactorBackupCodes[i], backupCode);

      if (isValid) {
        // Remove used backup code
        const remainingCodes = user.twoFactorBackupCodes.filter((_, index) => index !== i);

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            twoFactorBackupCodes: remainingCodes,
          },
        });

        return true;
      }
    }

    return false;
  }

  /**
   * Disable 2FA for user
   */
  async disable(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new BadRequestException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify password before disabling
    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    // Disable 2FA
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      },
    });

    // Send notification email
    try {
      await this.emailService.send2FADisabledNotification(
        updatedUser.email,
        updatedUser.firstName || 'User',
      );
    } catch (error) {
      console.error('Failed to send 2FA disabled email:', error);
    }

    return { disabled: true };
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new BadRequestException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify password before regenerating
    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    // Generate new backup codes
    const backupCodes = await this.generateBackupCodes();
    const hashedBackupCodes = await Promise.all(backupCodes.map((code) => argon2.hash(code)));

    // Update backup codes
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorBackupCodes: hashedBackupCodes,
      },
    });

    return {
      backupCodes, // Return plain codes only once
    };
  }

  /**
   * Get 2FA status for user
   */
  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        twoFactorEnabled: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      enabled: user.twoFactorEnabled,
      backupCodesRemaining: user.twoFactorBackupCodes.length,
    };
  }

  /**
   * Generate random backup codes
   */
  private async generateBackupCodes(count: number = 8): Promise<string[]> {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = this.generateRandomCode(8);
      codes.push(code);
    }

    return codes;
  }

  /**
   * Generate random alphanumeric code
   */
  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
    let code = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }

    return code;
  }
}
