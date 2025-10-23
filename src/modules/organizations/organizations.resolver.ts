import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrganizationsService } from './organizations.service';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationInput } from './dto/create-organization.input';
import { UpdateOrganizationInput } from './dto/update-organization.input';

@Resolver(() => Organization)
export class OrganizationsResolver {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Mutation(() => Organization)
  createOrganization(@Args('input') createInput: CreateOrganizationInput): Promise<Organization> {
    return this.organizationsService.create(createInput);
  }

  @Query(() => [Organization], { name: 'organizations' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 })
    skip: number,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 20 })
    take: number,
  ) {
    const result = await this.organizationsService.findAll(skip, take);
    return result.organizations;
  }

  @Query(() => Organization, { name: 'organization' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.organizationsService.findOne(id);
  }

  @Query(() => Organization, { name: 'organizationBySlug' })
  findBySlug(@Args('slug', { type: () => String }) slug: string) {
    return this.organizationsService.findBySlug(slug);
  }

  @Query(() => Organization, { name: 'organizationByDomain' })
  findByDomain(@Args('domain', { type: () => String }) domain: string) {
    return this.organizationsService.findByDomain(domain);
  }

  @Mutation(() => Organization)
  updateOrganization(
    @Args('id', { type: () => String }) id: string,
    @Args('input') updateInput: UpdateOrganizationInput,
  ) {
    return this.organizationsService.update(id, updateInput);
  }

  @Mutation(() => Organization)
  removeOrganization(@Args('id', { type: () => String }) id: string) {
    return this.organizationsService.remove(id);
  }

  @Mutation(() => Organization)
  restoreOrganization(@Args('id', { type: () => String }) id: string) {
    return this.organizationsService.restore(id);
  }

  // Subdomain-related queries
  @Query(() => Boolean)
  checkSubdomainAvailability(@Args('subdomain', { type: () => String }) subdomain: string) {
    return this.organizationsService.checkSubdomainAvailability(subdomain);
  }

  @Query(() => Organization, { nullable: true })
  getOrganizationBySubdomain(@Args('subdomain', { type: () => String }) subdomain: string) {
    return this.organizationsService.getOrganizationBySubdomain(subdomain);
  }

  @Query(() => [String])
  suggestAlternativeSubdomains(@Args('subdomain', { type: () => String }) subdomain: string) {
    return this.organizationsService.suggestAlternativeSubdomains(subdomain);
  }

  @Query(() => String, { nullable: true })
  async validateSubdomain(@Args('subdomain', { type: () => String }) subdomain: string) {
    const validation = await this.organizationsService.validateSubdomain(subdomain);
    return validation.isValid ? null : validation.error;
  }
}
