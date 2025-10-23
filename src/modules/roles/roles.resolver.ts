import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { AssignRoleInput } from './dto/assign-role.input';

@Resolver(() => Role)
export class RolesResolver {
  constructor(private readonly rolesService: RolesService) {}

  @Mutation(() => Role)
  createRole(@Args('input') createInput: CreateRoleInput): Promise<Role> {
    return this.rolesService.create(createInput);
  }

  @Query(() => [Role], { name: 'roles' })
  async findAll(
    @Args('organizationId', { type: () => String, nullable: true })
    organizationId?: string,
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 })
    skip?: number,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 20 })
    take?: number,
  ) {
    const result = await this.rolesService.findAll(organizationId, skip, take);
    return result.roles;
  }

  @Query(() => Role, { name: 'role' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.rolesService.findOne(id);
  }

  @Query(() => Role, { name: 'roleBySlug' })
  findBySlug(
    @Args('organizationId', { type: () => String, nullable: true })
    organizationId: string | null,
    @Args('slug', { type: () => String }) slug: string,
  ) {
    return this.rolesService.findBySlug(organizationId, slug);
  }

  @Mutation(() => Role)
  updateRole(
    @Args('id', { type: () => String }) id: string,
    @Args('input') updateInput: UpdateRoleInput,
  ) {
    return this.rolesService.update(id, updateInput);
  }

  @Mutation(() => Role)
  removeRole(@Args('id', { type: () => String }) id: string) {
    return this.rolesService.remove(id);
  }

  @Mutation(() => UserRole)
  assignRole(
    @Args('input') assignInput: AssignRoleInput,
    @Args('assignedBy', { type: () => String, nullable: true })
    assignedBy?: string,
  ) {
    return this.rolesService.assignRole(assignInput, assignedBy);
  }

  @Mutation(() => Boolean)
  async revokeRole(@Args('userRoleId', { type: () => String }) userRoleId: string) {
    await this.rolesService.revokeRole(userRoleId);
    return true;
  }

  @Query(() => [UserRole], { name: 'userRoles' })
  getUserRoles(@Args('userId', { type: () => String }) userId: string) {
    return this.rolesService.getUserRoles(userId);
  }

  @Query(() => [String], { name: 'userPermissions' })
  getUserPermissions(@Args('userId', { type: () => String }) userId: string) {
    return this.rolesService.getUserPermissions(userId);
  }
}
