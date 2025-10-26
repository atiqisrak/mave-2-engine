import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SubdomainService } from '../../modules/organizations/services/subdomain.service';

@Injectable()
export class SubdomainMiddleware implements NestMiddleware {
  constructor(private subdomainService: SubdomainService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract hostname from request
      const hostname = req.get('host') || req.hostname;
      
      // Extract subdomain
      const subdomain = this.subdomainService.extractSubdomainFromHost(hostname);
      
      // Try to get organization by subdomain if present
      if (subdomain) {
        try {
          const organization = await this.subdomainService.getOrganizationBySubdomain(subdomain);
          
          if (organization) {
            // Attach organization to request
            (req as any).organization = organization;
            (req as any).subdomain = subdomain;
            
            // Log for debugging
            if (process.env.NODE_ENV === 'development') {
              console.log(`✓ Subdomain detected: ${subdomain} → Organization: ${organization.name}`);
            }
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`⚠ No organization found for subdomain: ${subdomain}`);
            }
          }
        } catch (error) {
          // Organization not found - continue without organization context
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Organization not found for subdomain: ${subdomain}`);
          }
        }
      } else {
        // No subdomain detected
        if (process.env.NODE_ENV === 'development') {
          console.log(`→ Main domain access: ${hostname}`);
        }
      }
    } catch (error) {
      // Continue even if subdomain extraction fails
      console.error('Subdomain middleware error:', error);
    }
    
    next();
  }
}

