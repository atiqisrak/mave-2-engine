import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

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
}
