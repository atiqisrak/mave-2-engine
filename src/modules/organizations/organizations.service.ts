import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubdomainService } from './services/subdomain.service';
import { CreateOrganizationInput } from './dto/create-organization.input';
import { UpdateOrganizationInput } from './dto/update-organization.input';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private subdomainService: SubdomainService,
  ) {}

  async create(createInput: CreateOrganizationInput) {
    // Check if slug already exists
    const existingBySlug = await this.prisma.organization.findUnique({
      where: { slug: createInput.slug },
    });

    if (existingBySlug) {
      throw new ConflictException('Organization with this slug already exists');
    }

    // Handle domain/subdomain
    let domain = createInput.domain;
    
    // If no explicit domain provided, check for custom subdomain or auto-generate
    if (!domain) {
      if (createInput.customSubdomain) {
        // User provided a custom subdomain
        const validation = await this.subdomainService.validateAndReserveSubdomain(createInput.customSubdomain);
        if (!validation.isValid) {
          throw new BadRequestException(validation.error);
        }
        domain = createInput.customSubdomain;
      } else if (createInput.autoGenerateSubdomain !== false) {
        // Auto-generate from organization name (default behavior)
        domain = await this.subdomainService.generateUniqueSubdomain(createInput.name);
      }
    } else {
      // Validate explicitly provided domain
      const validation = await this.subdomainService.validateAndReserveSubdomain(domain);
      if (!validation.isValid) {
        throw new BadRequestException(validation.error);
      }
    }

    // Check if domain already exists
    const existingByDomain = await this.prisma.organization.findUnique({
      where: { domain },
    });

    if (existingByDomain) {
      throw new ConflictException('Organization with this domain already exists');
    }

    const organization = await this.prisma.organization.create({
      data: {
        name: createInput.name,
        slug: createInput.slug,
        domain,
        plan: createInput.plan || 'free',
        settings: {},
        branding: {},
      },
    });

    return {
      ...organization,
      settings: organization.settings as Record<string, any>,
      branding: organization.branding as Record<string, any>,
    };
  }

  async findAll(skip = 0, take = 20) {
    const [orgs, total] = await Promise.all([
      this.prisma.organization.findMany({
        where: { deletedAt: null },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.organization.count({
        where: { deletedAt: null },
      }),
    ]);

    const organizations = orgs.map((org) => ({
      ...org,
      settings: org.settings as Record<string, any>,
      branding: org.branding as Record<string, any>,
    }));

    return { organizations, total };
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization || organization.deletedAt) {
      throw new NotFoundException('Organization not found');
    }

    return {
      ...organization,
      settings: organization.settings as Record<string, any>,
      branding: organization.branding as Record<string, any>,
    };
  }

  async findBySlug(slug: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (!organization || organization.deletedAt) {
      throw new NotFoundException('Organization not found');
    }

    return {
      ...organization,
      settings: organization.settings as Record<string, any>,
      branding: organization.branding as Record<string, any>,
    };
  }

  async findByDomain(domain: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { domain },
    });

    if (!organization || organization.deletedAt) {
      throw new NotFoundException('Organization not found');
    }

    return {
      ...organization,
      settings: organization.settings as Record<string, any>,
      branding: organization.branding as Record<string, any>,
    };
  }

  async update(id: string, updateInput: UpdateOrganizationInput) {
    const organization = await this.findOne(id);

    // Check domain uniqueness if being updated
    if (updateInput.domain && updateInput.domain !== organization.domain) {
      const existingByDomain = await this.prisma.organization.findUnique({
        where: { domain: updateInput.domain },
      });

      if (existingByDomain) {
        throw new ConflictException('Organization with this domain already exists');
      }
    }

    const updated = await this.prisma.organization.update({
      where: { id },
      data: updateInput,
    });

    return {
      ...updated,
      settings: updated.settings as Record<string, any>,
      branding: updated.branding as Record<string, any>,
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    const deleted = await this.prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      ...deleted,
      settings: deleted.settings as Record<string, any>,
      branding: deleted.branding as Record<string, any>,
    };
  }

  async hardDelete(id: string) {
    await this.findOne(id);

    return this.prisma.organization.delete({
      where: { id },
    });
  }

  async restore(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (!organization.deletedAt) {
      throw new BadRequestException('Organization is not deleted');
    }

    const restored = await this.prisma.organization.update({
      where: { id },
      data: { deletedAt: null },
    });

    return {
      ...restored,
      settings: restored.settings as Record<string, any>,
      branding: restored.branding as Record<string, any>,
    };
  }

  // Subdomain-related methods
  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    return this.subdomainService.checkSubdomainAvailability(subdomain);
  }

  async getOrganizationBySubdomain(subdomain: string) {
    return this.subdomainService.getOrganizationBySubdomain(subdomain);
  }

  async suggestAlternativeSubdomains(subdomain: string): Promise<string[]> {
    return this.subdomainService.suggestAlternativeSubdomains(subdomain);
  }

  async validateSubdomain(subdomain: string) {
    return this.subdomainService.validateSubdomain(subdomain);
  }
}
