import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { TwoFactorService } from './services/two-factor.service';
import { EmailService } from '../email/email.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { JwtPayload, JwtTokens } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private twoFactorService: TwoFactorService,
    private emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerInput: RegisterInput) {
    // Verify organization exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: registerInput.organizationId },
    });

    if (!organization || organization.deletedAt) {
      throw new NotFoundException('Organization not found');
    }

    // Create user
    const user = await this.usersService.create({
      organizationId: registerInput.organizationId,
      email: registerInput.email,
      username: registerInput.username,
      password: registerInput.password,
      firstName: registerInput.firstName,
      lastName: registerInput.lastName,
    });

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.firstName || 'User');
    } catch (error) {
      // Don't fail registration if email fails
      console.error('Failed to send welcome email:', error);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user,
    };
  }

  async login(loginInput: LoginInput, ipAddress?: string) {
    // Find user by email or username
    let user;
    const isEmail = loginInput.emailOrUsername.includes('@');

    try {
      if (isEmail) {
        user = await this.prisma.user.findUnique({
          where: {
            organizationId_email: {
              organizationId: loginInput.organizationId,
              email: loginInput.emailOrUsername,
            },
          },
        });
      } else {
        user = await this.prisma.user.findUnique({
          where: {
            organizationId_username: {
              organizationId: loginInput.organizationId,
              username: loginInput.emailOrUsername,
            },
          },
        });
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    const isLocked = await this.usersService.isAccountLocked(user.id);
    if (isLocked) {
      throw new UnauthorizedException('Account is locked due to multiple failed login attempts');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.passwordHash, loginInput.password);

    if (!isPasswordValid) {
      await this.usersService.incrementFailedLoginAttempts(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      if (!loginInput.twoFactorCode) {
        // Generate a temporary token for 2FA verification
        const tempToken = await this.generateTempTwoFactorToken(user.id);
        return {
          requiresTwoFactor: true,
          twoFactorToken: tempToken,
          accessToken: null,
          refreshToken: null,
          user: null,
        };
      }

      // Verify 2FA code
      const isValidTotp = await this.twoFactorService.verifyToken(
        user.id,
        loginInput.twoFactorCode,
      );

      // If TOTP fails, try backup code
      let isValid = isValidTotp;
      if (!isValidTotp) {
        isValid = await this.twoFactorService.verifyBackupCode(user.id, loginInput.twoFactorCode);
      }

      if (!isValid) {
        await this.usersService.incrementFailedLoginAttempts(user.id);
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    // Update last login
    if (ipAddress) {
      await this.usersService.updateLastLogin(user.id, ipAddress);
    }

    // Send new login notification email
    try {
      await this.emailService.sendNewLoginNotification(
        user.email,
        user.firstName || 'User',
        ipAddress || 'Unknown',
        new Date(),
      );
    } catch (error) {
      // Don't fail login if email fails
      console.error('Failed to send new login email:', error);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user,
      requiresTwoFactor: false,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Get user
      const user = await this.usersService.findOne(payload.sub);

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string) {
    try {
      return await this.usersService.findOne(userId);
    } catch (error) {
      throw new UnauthorizedException('User not found');
    }
  }

  private async generateTokens(user: any): Promise<JwtTokens> {
    const payload: Omit<JwtPayload, 'type' | 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '30d',
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async generateTempTwoFactorToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, type: '2fa' },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '5m',
      },
    );
  }

  async logout(userId: string) {
    // In a real application, you would blacklist the token
    // For now, we'll just return success
    return { success: true, message: 'Logged out successfully' };
  }

  async requestPasswordReset(organizationId: string, email: string) {
    try {
      const user = await this.usersService.findByEmail(organizationId, email);

      // Generate reset token
      const resetToken = await this.jwtService.signAsync(
        { sub: user.id, type: 'password-reset' },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '1h',
        },
      );

      // Save reset token to user
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      // Send password reset email
      try {
        await this.emailService.sendPasswordResetEmail(
          user.email,
          user.firstName || 'User',
          resetToken,
        );
      } catch (error) {
        console.error('Failed to send password reset email:', error);
      }

      return {
        success: true,
        message: 'Password reset email sent',
      };
    } catch (error) {
      // Don't reveal if email exists
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      };
    }
  }

  async resetPassword(resetToken: string, newPassword: string) {
    try {
      const payload = await this.jwtService.verifyAsync(resetToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.usersService.findOne(payload.sub);

      // Verify token matches and hasn't expired
      if (
        user.passwordResetToken !== resetToken ||
        !user.passwordResetExpiresAt ||
        new Date() > user.passwordResetExpiresAt
      ) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Update password
      await this.usersService.updatePassword(user.id, newPassword);

      // Clear reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: null,
          passwordResetExpiresAt: null,
        },
      });

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }
}
