import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createInput: CreateUserInput) {
    // Check if organization exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: createInput.organizationId },
    });

    if (!organization || organization.deletedAt) {
      throw new NotFoundException('Organization not found');
    }

    // Check if email already exists in organization
    const existingEmail = await this.prisma.user.findUnique({
      where: {
        organizationId_email: {
          organizationId: createInput.organizationId,
          email: createInput.email,
        },
      },
    });

    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if username already exists in organization (if provided)
    if (createInput.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: {
          organizationId_username: {
            organizationId: createInput.organizationId,
            username: createInput.username,
          },
        },
      });

      if (existingUsername) {
        throw new ConflictException('User with this username already exists');
      }
    }

    // Hash password
    const passwordHash = await argon2.hash(createInput.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        organizationId: createInput.organizationId,
        email: createInput.email,
        username: createInput.username,
        passwordHash,
        firstName: createInput.firstName,
        lastName: createInput.lastName,
        phone: createInput.phone,
        preferences: {},
        metadata: {},
      },
    });

    return {
      ...user,
      preferences: user.preferences as Record<string, any>,
      metadata: user.metadata as Record<string, any>,
    };
  }

  async findAll(organizationId: string, skip = 0, take = 20) {
    const [usersList, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          organizationId,
          deletedAt: null,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: {
          organizationId,
          deletedAt: null,
        },
      }),
    ]);

    const users = usersList.map((user) => ({
      ...user,
      preferences: user.preferences as Record<string, any>,
      metadata: user.metadata as Record<string, any>,
    }));

    return { users, total };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      preferences: user.preferences as Record<string, any>,
      metadata: user.metadata as Record<string, any>,
    };
  }

  async findByEmail(organizationId: string, email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email,
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      preferences: user.preferences as Record<string, any>,
      metadata: user.metadata as Record<string, any>,
    };
  }

  async findByUsername(organizationId: string, username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        organizationId_username: {
          organizationId,
          username,
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      preferences: user.preferences as Record<string, any>,
      metadata: user.metadata as Record<string, any>,
    };
  }

  async update(id: string, updateInput: UpdateUserInput) {
    const user = await this.findOne(id);

    // Check email uniqueness if being updated
    if (updateInput.email && updateInput.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: {
          organizationId_email: {
            organizationId: user.organizationId,
            email: updateInput.email,
          },
        },
      });

      if (existingEmail) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Check username uniqueness if being updated
    if (updateInput.username && updateInput.username !== user.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: {
          organizationId_username: {
            organizationId: user.organizationId,
            username: updateInput.username,
          },
        },
      });

      if (existingUsername) {
        throw new ConflictException('User with this username already exists');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateInput,
    });

    return {
      ...updated,
      preferences: updated.preferences as Record<string, any>,
      metadata: updated.metadata as Record<string, any>,
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    const deleted = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      ...deleted,
      preferences: deleted.preferences as Record<string, any>,
      metadata: deleted.metadata as Record<string, any>,
    };
  }

  async restore(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.deletedAt) {
      throw new BadRequestException('User is not deleted');
    }

    const restored = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });

    return {
      ...restored,
      preferences: restored.preferences as Record<string, any>,
      metadata: restored.metadata as Record<string, any>,
    };
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return false;
    }
    return argon2.verify(user.passwordHash, password);
  }

  async updatePassword(userId: string, newPassword: string) {
    const passwordHash = await argon2.hash(newPassword);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return {
      ...updated,
      preferences: updated.preferences as Record<string, any>,
      metadata: updated.metadata as Record<string, any>,
    };
  }

  async markEmailAsVerified(userId: string) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
      },
    });

    return {
      ...updated,
      preferences: updated.preferences as Record<string, any>,
      metadata: updated.metadata as Record<string, any>,
    };
  }

  async updateLastLogin(userId: string, ipAddress: string) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        lastActivityAt: new Date(),
        failedLoginAttempts: 0,
      },
    });

    return {
      ...updated,
      preferences: updated.preferences as Record<string, any>,
      metadata: updated.metadata as Record<string, any>,
    };
  }

  async incrementFailedLoginAttempts(userId: string) {
    const user = await this.findOne(userId);
    const failedAttempts = user.failedLoginAttempts + 1;

    // Lock account after 5 failed attempts for 30 minutes
    const lockedUntil =
      failedAttempts >= 5
        ? new Date(Date.now() + 30 * 60 * 1000)
        : user.lockedUntil;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: failedAttempts,
        lockedUntil,
      },
    });

    return {
      ...updated,
      preferences: updated.preferences as Record<string, any>,
      metadata: updated.metadata as Record<string, any>,
    };
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.findOne(userId);

    if (!user.lockedUntil) {
      return false;
    }

    if (new Date() > user.lockedUntil) {
      // Unlock account
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          lockedUntil: null,
          failedLoginAttempts: 0,
        },
      });
      return false;
    }

    return true;
  }
}

