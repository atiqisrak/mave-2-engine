import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';
import { CreatePermissionInput } from './dto/create-permission.input';
import { UpdatePermissionInput } from './dto/update-permission.input';

@Resolver(() => Permission)
export class PermissionsResolver {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Mutation(() => Permission)
  createPermission(
    @Args('input') createInput: CreatePermissionInput,
  ): Promise<Permission> {
    return this.permissionsService.create(createInput);
  }

  @Query(() => [Permission], { name: 'permissions' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 })
    skip: number,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 100 })
    take: number,
  ) {
    const result = await this.permissionsService.findAll(skip, take);
    return result.permissions;
  }

  @Query(() => [Permission], { name: 'permissionsByModule' })
  findByModule(@Args('module', { type: () => String }) module: string) {
    return this.permissionsService.findByModule(module);
  }

  @Query(() => Permission, { name: 'permission' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.permissionsService.findOne(id);
  }

  @Query(() => Permission, { name: 'permissionBySlug' })
  findBySlug(@Args('slug', { type: () => String }) slug: string) {
    return this.permissionsService.findBySlug(slug);
  }

  @Mutation(() => Permission)
  updatePermission(
    @Args('id', { type: () => String }) id: string,
    @Args('input') updateInput: UpdatePermissionInput,
  ) {
    return this.permissionsService.update(id, updateInput);
  }

  @Mutation(() => Permission)
  removePermission(@Args('id', { type: () => String }) id: string) {
    return this.permissionsService.remove(id);
  }

  @Query(() => Boolean, { name: 'checkPermission' })
  checkPermission(
    @Args('userId', { type: () => String }) userId: string,
    @Args('permissionSlug', { type: () => String }) permissionSlug: string,
  ) {
    return this.permissionsService.checkPermission(userId, permissionSlug);
  }

  @Query(() => [Permission], { name: 'userPermissionsWithDetails' })
  getUserPermissionsWithDetails(
    @Args('userId', { type: () => String }) userId: string,
  ) {
    return this.permissionsService.getUserPermissionsWithDetails(userId);
  }
}

