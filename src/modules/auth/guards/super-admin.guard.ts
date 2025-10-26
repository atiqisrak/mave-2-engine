import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    
    if (!request.user) {
      throw new ForbiddenException('Authentication required');
    }

    // Get user ID from either 'id' or 'sub' property
    const userId = request.user.id || request.user.sub;
    
    if (!userId) {
      throw new ForbiddenException('User ID not found');
    }
    
    // Check if user has super admin role
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        isActive: true,
        role: {
          slug: 'super-admin',
          isSystem: true,
          deletedAt: null,
        },
      },
      include: {
        role: true,
      },
    });

    if (!userRole) {
      throw new ForbiddenException('Super admin access required');
    }

    return true;
  }
}
