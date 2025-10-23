import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../database/prisma.service';
import { RolesService } from '../roles/roles.service';
import { CreatePermissionInput } from './dto/create-permission.input';
import { UpdatePermissionInput } from './dto/update-permission.input';

@Injectable()
export class PermissionsService {
  constructor(
    private prisma: PrismaService,
    private rolesService: RolesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createInput: CreatePermissionInput) {
    // Check if slug already exists
    const existing = await this.prisma.permission.findUnique({
      where: { slug: createInput.slug },
    });

    if (existing) {
      throw new ConflictException('Permission with this slug already exists');
    }

    const permission = await this.prisma.permission.create({
      data: {
        name: createInput.name,
        slug: createInput.slug,
        description: createInput.description,
        module: createInput.module,
        category: createInput.category,
        permissionType: createInput.permissionType || 'action',
        dependsOn: createInput.dependsOn || [],
        conflictsWith: createInput.conflictsWith || [],
        riskLevel: createInput.riskLevel || 'low',
        requiresMfa: createInput.requiresMfa || false,
        requiresApproval: createInput.requiresApproval || false,
        metadata: {},
      },
    });

    return {
      ...permission,
      metadata: permission.metadata as Record<string, any>,
    };
  }

  async findAll(skip = 0, take = 100) {
    const [permissionsList, total] = await Promise.all([
      this.prisma.permission.findMany({
        where: { isActive: true, isDeprecated: false },
        skip,
        take,
        orderBy: [{ module: 'asc' }, { category: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.permission.count({
        where: { isActive: true, isDeprecated: false },
      }),
    ]);

    const permissions = permissionsList.map((permission) => ({
      ...permission,
      metadata: permission.metadata as Record<string, any>,
    }));

    return { permissions, total };
  }

  async findByModule(module: string) {
    const perms = await this.prisma.permission.findMany({
      where: {
        module,
        isActive: true,
        isDeprecated: false,
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return perms.map((permission) => ({
      ...permission,
      metadata: permission.metadata as Record<string, any>,
    }));
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return {
      ...permission,
      metadata: permission.metadata as Record<string, any>,
    };
  }

  async findBySlug(slug: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { slug },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return {
      ...permission,
      metadata: permission.metadata as Record<string, any>,
    };
  }

  async update(id: string, updateInput: UpdatePermissionInput) {
    const permission = await this.findOne(id);

    if (permission.isSystem) {
      throw new BadRequestException('Cannot modify system permissions');
    }

    // Clear cache for this permission
    await this.clearPermissionCache(permission.slug);

    const updated = await this.prisma.permission.update({
      where: { id },
      data: updateInput,
    });

    return {
      ...updated,
      metadata: updated.metadata as Record<string, any>,
    };
  }

  async remove(id: string) {
    const permission = await this.findOne(id);

    if (permission.isSystem) {
      throw new BadRequestException('Cannot delete system permissions');
    }

    await this.clearPermissionCache(permission.slug);

    const deactivated = await this.prisma.permission.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      ...deactivated,
      metadata: deactivated.metadata as Record<string, any>,
    };
  }

  /**
   * Check if a user has a specific permission
   */
  async checkPermission(
    userId: string,
    permissionSlug: string,
    context?: {
      resourceType?: string;
      resourceId?: string;
      organizationId?: string;
    },
  ): Promise<boolean> {
    // Check cache first
    const cacheKey = `user:${userId}:permission:${permissionSlug}`;
    const cached = await this.cacheManager.get<boolean>(cacheKey);

    if (cached !== undefined && cached !== null) {
      return cached;
    }

    // Get user's permissions
    const userPermissions = await this.rolesService.getUserPermissions(userId);

    // Check if user has the permission
    const hasPermission = userPermissions.includes(permissionSlug);

    // Cache the result for 5 minutes
    await this.cacheManager.set(cacheKey, hasPermission, 300000);

    return hasPermission;
  }

  /**
   * Check if a user has all of the specified permissions
   */
  async checkPermissions(userId: string, permissionSlugs: string[]): Promise<boolean> {
    const userPermissions = await this.rolesService.getUserPermissions(userId);

    return permissionSlugs.every((slug) => userPermissions.includes(slug));
  }

  /**
   * Check if a user has any of the specified permissions
   */
  async checkAnyPermission(userId: string, permissionSlugs: string[]): Promise<boolean> {
    const userPermissions = await this.rolesService.getUserPermissions(userId);

    return permissionSlugs.some((slug) => userPermissions.includes(slug));
  }

  /**
   * Get all permissions for a user with details
   */
  async getUserPermissionsWithDetails(userId: string) {
    const userPermissionSlugs = await this.rolesService.getUserPermissions(userId);

    if (userPermissionSlugs.length === 0) {
      return [];
    }

    const perms = await this.prisma.permission.findMany({
      where: {
        slug: { in: userPermissionSlugs },
        isActive: true,
      },
    });

    return perms.map((permission) => ({
      ...permission,
      metadata: permission.metadata as Record<string, any>,
    }));
  }

  /**
   * Clear permission cache for a user
   */
  async clearUserPermissionCache(userId: string) {
    // In a real implementation, we would use a pattern-based cache clear
    // For now, we'll just clear the cache manager
    const userPermissions = await this.rolesService.getUserPermissions(userId);

    for (const permission of userPermissions) {
      const cacheKey = `user:${userId}:permission:${permission}`;
      await this.cacheManager.del(cacheKey);
    }
  }

  /**
   * Clear cache for a specific permission
   */
  private async clearPermissionCache(permissionSlug: string) {
    // In a production system, you'd want to clear all user caches for this permission
    // This is a simplified version
    await this.cacheManager.reset();
  }
}
