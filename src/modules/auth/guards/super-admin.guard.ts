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

    const userId = request.user.sub;
    
    // Check if user has super admin role
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        isActive: true,
        role: {
          slug: 'super-admin',
          isSystem: true,
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
