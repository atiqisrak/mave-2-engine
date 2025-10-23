import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubdomainService {
  private readonly reservedSubdomains: string[] = [
    'www', 'api', 'admin', 'app', 'mail', 'ftp', 'smtp', 'cdn', 'static',
    'blog', 'docs', 'help', 'support', 'status', 'monitor', 'dev', 'staging',
    'test', 'demo', 'beta', 'alpha', 'preview', 'sandbox', 'playground'
  ];

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Load additional reserved subdomains from config
    const additionalReserved = this.configService.get<string>('RESERVED_SUBDOMAINS');
    if (additionalReserved) {
      this.reservedSubdomains.push(...additionalReserved.split(',').map(s => s.trim()));
    }
  }

  /**
   * Generate a URL-safe subdomain from organization name
   */
  generateSubdomain(orgName: string): string {
    // Convert to lowercase and replace spaces/special chars with hyphens
    let subdomain = orgName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    // Ensure minimum length
    if (subdomain.length < 3) {
      subdomain = subdomain + '-org';
    }

    // Ensure maximum length (63 chars for subdomain)
    if (subdomain.length > 63) {
      subdomain = subdomain.substring(0, 63).replace(/-+$/, '');
    }

    return subdomain;
  }

  /**
   * Validate subdomain format
   */
  validateSubdomain(subdomain: string): { isValid: boolean; error?: string } {
    if (!subdomain || subdomain.length < 3) {
      return { isValid: false, error: 'Subdomain must be at least 3 characters long' };
    }

    if (subdomain.length > 63) {
      return { isValid: false, error: 'Subdomain must be 63 characters or less' };
    }

    // Check format: only lowercase letters, numbers, and hyphens
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      return { isValid: false, error: 'Subdomain can only contain lowercase letters, numbers, and hyphens' };
    }

    // Cannot start or end with hyphen
    if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
      return { isValid: false, error: 'Subdomain cannot start or end with a hyphen' };
    }

    // Check against reserved subdomains
    if (this.reservedSubdomains.includes(subdomain)) {
      return { isValid: false, error: 'This subdomain is reserved and cannot be used' };
    }

    return { isValid: true };
  }

  /**
   * Check if subdomain is available
   */
  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    const validation = this.validateSubdomain(subdomain);
    if (!validation.isValid) {
      return false;
    }

    // Check if subdomain is already taken
    const existing = await this.prisma.organization.findUnique({
      where: { domain: subdomain },
    });

    return !existing;
  }

  /**
   * Suggest alternative subdomains if the requested one is taken
   */
  async suggestAlternativeSubdomains(originalSubdomain: string, maxSuggestions = 5): Promise<string[]> {
    const suggestions: string[] = [];
    const base = originalSubdomain;

    // Try adding numbers
    for (let i = 1; i <= 99 && suggestions.length < maxSuggestions; i++) {
      const candidate = `${base}-${i}`;
      if (await this.checkSubdomainAvailability(candidate)) {
        suggestions.push(candidate);
      }
    }

    // Try adding random suffixes
    const suffixes = ['app', 'team', 'co', 'inc', 'ltd', 'org', 'net'];
    for (const suffix of suffixes) {
      if (suggestions.length >= maxSuggestions) break;
      const candidate = `${base}-${suffix}`;
      if (await this.checkSubdomainAvailability(candidate)) {
        suggestions.push(candidate);
      }
    }

    // Try adding year
    const currentYear = new Date().getFullYear();
    const candidate = `${base}-${currentYear}`;
    if (suggestions.length < maxSuggestions && await this.checkSubdomainAvailability(candidate)) {
      suggestions.push(candidate);
    }

    return suggestions;
  }

  /**
   * Get organization by subdomain
   */
  async getOrganizationBySubdomain(subdomain: string) {
    return this.prisma.organization.findUnique({
      where: { domain: subdomain },
      include: {
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });
  }

  /**
   * Generate a unique subdomain for an organization
   */
  async generateUniqueSubdomain(orgName: string): Promise<string> {
    let subdomain = this.generateSubdomain(orgName);
    let counter = 1;

    // Check if the generated subdomain is available
    while (!(await this.checkSubdomainAvailability(subdomain))) {
      subdomain = `${this.generateSubdomain(orgName)}-${counter}`;
      counter++;

      // Prevent infinite loop
      if (counter > 1000) {
        throw new BadRequestException('Unable to generate unique subdomain');
      }
    }

    return subdomain;
  }

  /**
   * Validate and reserve subdomain for organization creation
   */
  async validateAndReserveSubdomain(subdomain: string, organizationId?: string): Promise<{
    isValid: boolean;
    subdomain?: string;
    error?: string;
    suggestions?: string[];
  }> {
    // Validate format
    const validation = this.validateSubdomain(subdomain);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: validation.error,
        suggestions: await this.suggestAlternativeSubdomains(subdomain),
      };
    }

    // Check availability
    const isAvailable = await this.checkSubdomainAvailability(subdomain);
    if (!isAvailable) {
      return {
        isValid: false,
        error: 'Subdomain is already taken',
        suggestions: await this.suggestAlternativeSubdomains(subdomain),
      };
    }

    return {
      isValid: true,
      subdomain,
    };
  }
}
