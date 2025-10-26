import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class SubdomainOrganizationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    
    // Get user from request (set by JWT strategy)
    const user = req.user;
    
    // Get organization from request (set by subdomain middleware)
    const subdomainOrganization = (req as any).organization;
    
    // If no subdomain detected, allow (main domain access)
    if (!subdomainOrganization) {
      return true;
    }
    
    // If no user (not authenticated), continue to auth guard
    if (!user) {
      return true;
    }
    
    // Verify user's organization matches subdomain organization
    if (user.organizationId !== subdomainOrganization.id) {
      throw new ForbiddenException(
        `Access denied: You are trying to access ${subdomainOrganization.name} but you belong to a different organization.`
      );
    }
    
    return true;
  }
}
