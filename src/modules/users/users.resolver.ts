import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphQLJSON } from 'graphql-scalars';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserDetails, SafeUser } from './entities/user-details.entity';
import { UserRoleWithDetails } from './entities/user-role-with-details.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { RolesService } from '../roles/roles.service';
import { PermissionsService } from '../permissions/permissions.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Mutation(() => User)
  createUser(@Args('input') createInput: CreateUserInput): Promise<User> {
    return this.usersService.create(createInput);
  }

  @Query(() => [User], { name: 'users' })
  async findAll(
    @Args('organizationId', { type: () => String }) organizationId: string,
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 })
    skip: number,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 20 })
    take: number,
  ) {
    const result = await this.usersService.findAll(organizationId, skip, take);
    return result.users;
  }

  @Query(() => [User], { name: 'allUsers' })
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async findAllUsers(
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 })
    skip: number,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 100 })
    take: number,
  ) {
    const result = await this.usersService.findAllUsers(skip, take);
    return result.users;
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.usersService.findOne(id);
  }

  @Query(() => User, { name: 'userByEmail' })
  findByEmail(
    @Args('organizationId', { type: () => String }) organizationId: string,
    @Args('email', { type: () => String }) email: string,
  ) {
    return this.usersService.findByEmail(organizationId, email);
  }

  @Mutation(() => User)
  updateUser(
    @Args('id', { type: () => String }) id: string,
    @Args('input') updateInput: UpdateUserInput,
  ) {
    return this.usersService.update(id, updateInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => String }) id: string) {
    return this.usersService.remove(id);
  }

  @Mutation(() => User)
  restoreUser(@Args('id', { type: () => String }) id: string) {
    return this.usersService.restore(id);
  }

  @Query(() => UserDetails, { name: 'userDetails' })
  async getUserDetails(@Args('id', { type: () => String }) id: string) {
    // Get user basic information
    const user = await this.usersService.findOne(id);
    
    // Get user's organization
    const organization = await this.organizationsService.findOne(user.organizationId);
    
    // Get user's roles
    const userRoles = await this.rolesService.getUserRoles(id);
    
    // Get user's permissions
    const userPermissions = await this.rolesService.getUserPermissions(id);
    
    // Get detailed permissions
    const detailedPermissions = await this.permissionsService.getUserPermissionsWithDetails(id);
    
    // Create safe user object without sensitive fields
    const safeUser: SafeUser = {
      id: user.id,
      organizationId: user.organizationId,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      emailVerifiedAt: user.emailVerifiedAt,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLoginAt: user.lastLoginAt,
      lastLoginIp: user.lastLoginIp,
      lastActivityAt: user.lastActivityAt,
      status: user.status,
      isSystem: user.isSystem,
      timezone: user.timezone,
      locale: user.locale,
      preferences: user.preferences,
      metadata: user.metadata,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
    
    // Transform roles to include nested role data
    const rolesWithDetails: UserRoleWithDetails[] = userRoles.map((userRole: any) => ({
      id: userRole.id,
      userId: userRole.userId,
      roleId: userRole.roleId,
      scope: userRole.scope,
      resourceType: userRole.resourceType,
      resourceId: userRole.resourceId,
      conditions: userRole.conditions,
      startsAt: userRole.startsAt,
      expiresAt: userRole.expiresAt,
      assignedBy: userRole.assignedBy,
      assignedReason: userRole.assignedReason,
      assignedAt: userRole.assignedAt,
      isActive: userRole.isActive,
      createdAt: userRole.createdAt,
      role: userRole.role,
    }));
    
    return {
      user: safeUser,
      organization,
      roles: rolesWithDetails,
      permissions: userPermissions,
      detailedPermissions,
    };
  }
}
