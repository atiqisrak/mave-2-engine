import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String)
  health(): string {
    return 'OK';
  }

  @Query(() => String)
  hello(): string {
    return 'Welcome to Mave CMS!';
  }
}

