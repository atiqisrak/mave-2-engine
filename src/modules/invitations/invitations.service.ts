import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { RolesService } from '../roles/roles.service';
import { CreateInvitationInput } from './dto/create-invitation.input';
import { AcceptInvitationInput } from './dto/accept-invitation.input';
import { InvitationValidation } from './entities/invitation-response.entity';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private rolesService: RolesService,
  ) {}

  async createEmailInvitation(
    organizationId: string,
    email: string,
    roleId: string | null,
    invitedBy: string,
  ) {
    // Check if user already exists in organization
    const existingUser = await this.prisma.user.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email,
        },
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in the organization');
    }

    // Check if invitation already exists
    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        organizationId,
        email,
        status: 'pending',
      },
    });

    if (existingInvitation) {
      throw new ConflictException('Invitation already exists for this email');
    }

    // Generate token
    const token = this.generateInvitationToken();

    // Set expiry date (default 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = await this.prisma.invitation.create({
      data: {
        organizationId,
        email,
        token,
        roleId,
        invitedBy,
        expiresAt,
        type: 'email',
        metadata: {},
      },
      include: {
        organization: true,
        inviter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send invitation email
    try {
      await this.emailService.sendInvitationEmail(
        email,
        `${invitation.inviter.firstName} ${invitation.inviter.lastName}`,
        invitation.organization.name,
        token,
        expiresAt,
      );
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      // Don't fail invitation creation if email fails
    }

    return invitation;
  }

  async createShareableInvitation(
    organizationId: string,
    roleId: string | null,
    maxUses: number | null,
    invitedBy: string,
  ) {
    // Generate token
    const token = this.generateInvitationToken();

    // Set expiry date (default 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = await this.prisma.invitation.create({
      data: {
        organizationId,
        email: null, // null for shareable links
        token,
        roleId,
        invitedBy,
        expiresAt,
        type: 'link',
        maxUses,
        metadata: {},
      },
      include: {
        organization: true,
        inviter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return invitation;
  }

  async validateInvitation(token: string): Promise<InvitationValidation> {
    try {
      const invitation = await this.prisma.invitation.findUnique({
        where: { token },
        include: {
          organization: true,
          inviter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!invitation) {
        return {
          isValid: false,
          error: 'Invalid invitation token',
        };
      }

      if (invitation.status !== 'pending') {
        return {
          isValid: false,
          error: 'Invitation has already been used or revoked',
        };
      }

      if (new Date() > invitation.expiresAt) {
        return {
          isValid: false,
          error: 'Invitation has expired',
        };
      }

      if (invitation.type === 'link' && invitation.maxUses && invitation.usedCount >= invitation.maxUses) {
        return {
          isValid: false,
          error: 'Invitation link has reached maximum uses',
        };
      }

      return {
        isValid: true,
        invitation: invitation as any,
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid invitation token',
      };
    }
  }

  async acceptInvitation(token: string, userId: string) {
    const validation = await this.validateInvitation(token);
    
    if (!validation.isValid || !validation.invitation) {
      throw new BadRequestException(validation.error || 'Invalid invitation');
    }

    const invitation = validation.invitation;

    // Check if user already exists in organization
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.organizationId !== invitation.organizationId) {
      throw new BadRequestException('User is not in the correct organization');
    }

    // Mark invitation as accepted
    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        acceptedBy: userId,
        acceptedAt: new Date(),
        usedCount: invitation.usedCount + 1,
      },
    });

    // Assign role if specified
    if (invitation.roleId) {
      try {
        await this.rolesService.assignRole(
          {
            userId,
            roleId: invitation.roleId,
            scope: 'global',
          },
          invitation.invitedBy,
        );
      } catch (error) {
        console.error('Failed to assign role:', error);
        // Don't fail invitation acceptance if role assignment fails
      }
    }

    // Send notification to inviter
    try {
      if (invitation.inviter && invitation.organization) {
        await this.emailService.sendInvitationAcceptedEmail(
          invitation.inviter.email,
          `${user.firstName} ${user.lastName}`,
          invitation.organization.name,
        );
      }
    } catch (error) {
      console.error('Failed to send acceptance notification:', error);
    }

    return {
      success: true,
      message: 'Invitation accepted successfully',
    };
  }

  async revokeInvitation(invitationId: string, revokedBy: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException('Cannot revoke invitation that is not pending');
    }

    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: {
        status: 'revoked',
        metadata: {
          ...(invitation.metadata as Record<string, any>),
          revokedBy,
          revokedAt: new Date(),
        },
      },
    });

    return {
      success: true,
      message: 'Invitation revoked successfully',
    };
  }

  async resendInvitation(invitationId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        organization: true,
        inviter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.type !== 'email' || !invitation.email) {
      throw new BadRequestException('Cannot resend non-email invitation');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException('Cannot resend invitation that is not pending');
    }

    // Update expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { expiresAt },
    });

    // Resend email
    try {
      await this.emailService.sendInvitationEmail(
        invitation.email,
        `${invitation.inviter.firstName} ${invitation.inviter.lastName}`,
        invitation.organization.name,
        invitation.token,
        expiresAt,
      );
    } catch (error) {
      console.error('Failed to resend invitation email:', error);
      throw new BadRequestException('Failed to resend invitation email');
    }

    return {
      success: true,
      message: 'Invitation resent successfully',
    };
  }

  async listOrganizationInvitations(
    organizationId: string,
    status?: string,
    skip = 0,
    take = 20,
  ) {
    const where: any = { organizationId };
    if (status) {
      where.status = status;
    }

    const [invitations, total] = await Promise.all([
      this.prisma.invitation.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          inviter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          accepter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.invitation.count({ where }),
    ]);

    return {
      invitations,
      total,
    };
  }

  private generateInvitationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
