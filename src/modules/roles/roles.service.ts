import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { AssignRoleInput } from './dto/assign-role.input';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createInput: CreateRoleInput) {
    // If organizationId is provided, check it exists
    if (createInput.organizationId) {
      const organization = await this.prisma.organization.findUnique({
        where: { id: createInput.organizationId },
      });

      if (!organization || organization.deletedAt) {
        throw new NotFoundException('Organization not found');
      }

      // Check slug uniqueness within organization
      const existing = await this.prisma.role.findUnique({
        where: {
          organizationId_slug: {
            organizationId: createInput.organizationId,
            slug: createInput.slug,
          },
        },
      });

      if (existing) {
        throw new ConflictException('Role with this slug already exists');
      }
    } else {
      // System role - check global slug uniqueness
      const existing = await this.prisma.role.findFirst({
        where: {
          slug: createInput.slug,
          organizationId: null,
        },
      });

      if (existing) {
        throw new ConflictException('System role with this slug already exists');
      }
    }

    const role = await this.prisma.role.create({
      data: {
        organizationId: createInput.organizationId,
        name: createInput.name,
        slug: createInput.slug,
        description: createInput.description,
        parentRoleId: createInput.parentRoleId,
        level: createInput.level || 0,
        permissions: createInput.permissions || [],
        color: createInput.color,
        icon: createInput.icon,
        priority: createInput.priority || 0,
        isAssignable: createInput.isAssignable ?? true,
        isDefault: createInput.isDefault ?? false,
        isSystem: !createInput.organizationId,
        metadata: {},
      },
    });

    return {
      ...role,
      metadata: role.metadata as Record<string, any>,
    };
  }

  async findAll(organizationId?: string, skip = 0, take = 20) {
    const where = organizationId ? { organizationId, deletedAt: null } : { deletedAt: null };

    const [rolesList, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.role.count({ where }),
    ]);

    const roles = rolesList.map((role) => ({
      ...role,
      metadata: role.metadata as Record<string, any>,
    }));

    return { roles, total };
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role || role.deletedAt) {
      throw new NotFoundException('Role not found');
    }

    return {
      ...role,
      metadata: role.metadata as Record<string, any>,
    };
  }

  async findBySlug(organizationId: string | null, slug: string) {
    let role;

    if (organizationId) {
      role = await this.prisma.role.findUnique({
        where: {
          organizationId_slug: {
            organizationId,
            slug,
          },
        },
      });
    } else {
      role = await this.prisma.role.findFirst({
        where: {
          slug,
          organizationId: null,
        },
      });
    }

    if (!role || role.deletedAt) {
      throw new NotFoundException('Role not found');
    }

    return {
      ...role,
      metadata: role.metadata as Record<string, any>,
    };
  }

  async update(id: string, updateInput: UpdateRoleInput) {
    const role = await this.findOne(id);

    // Prevent modifying system roles
    if (role.isSystem) {
      throw new BadRequestException('Cannot modify system roles');
    }

    const updated = await this.prisma.role.update({
      where: { id },
      data: updateInput,
    });

    return {
      ...updated,
      metadata: updated.metadata as Record<string, any>,
    };
  }

  async remove(id: string) {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    const deleted = await this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      ...deleted,
      metadata: deleted.metadata as Record<string, any>,
    };
  }

  async assignRole(assignInput: AssignRoleInput, assignedBy?: string) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: assignInput.userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    // Verify role exists and is assignable
    const role = await this.findOne(assignInput.roleId);

    if (!role.isAssignable) {
      throw new BadRequestException('This role cannot be assigned');
    }

    // Check if assignment already exists
    const existing = await this.prisma.userRole.findFirst({
      where: {
        userId: assignInput.userId,
        roleId: assignInput.roleId,
        scope: assignInput.scope || 'global',
        resourceType: assignInput.resourceType,
        resourceId: assignInput.resourceId,
      },
    });

    if (existing) {
      throw new ConflictException('Role already assigned to user');
    }

    return this.prisma.userRole.create({
      data: {
        userId: assignInput.userId,
        roleId: assignInput.roleId,
        scope: assignInput.scope || 'global',
        resourceType: assignInput.resourceType,
        resourceId: assignInput.resourceId,
        conditions: assignInput.conditions || {},
        expiresAt: assignInput.expiresAt ? new Date(assignInput.expiresAt) : null,
        assignedBy,
        assignedReason: assignInput.assignedReason,
        isActive: assignInput.isActive ?? true,
      },
    });
  }

  async revokeRole(userRoleId: string) {
    const userRole = await this.prisma.userRole.findUnique({
      where: { id: userRoleId },
    });

    if (!userRole) {
      throw new NotFoundException('User role assignment not found');
    }

    return this.prisma.userRole.delete({
      where: { id: userRoleId },
    });
  }

  async getUserRoles(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        role: true,
      },
      orderBy: { assignedAt: 'desc' },
    });

    return userRoles;
  }

  async getRoleUsers(roleId: string) {
    const role = await this.findOne(roleId);

    const userRoles = await this.prisma.userRole.findMany({
      where: {
        roleId,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        user: true,
      },
      orderBy: { assignedAt: 'desc' },
    });

    return userRoles;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.getUserRoles(userId);

    // Collect all permissions from all active roles
    const permissions = new Set<string>();

    for (const userRole of userRoles) {
      if (userRole.role.permissions) {
        userRole.role.permissions.forEach((permission) => permissions.add(permission));
      }

      // If role has a parent, inherit permissions (will be implemented)
      // TODO: Implement role hierarchy permission inheritance
    }

    return Array.from(permissions);
  }
}
