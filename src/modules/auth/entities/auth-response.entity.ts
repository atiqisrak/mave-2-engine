import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => User)
  user: User;

  @Field(() => Boolean, { nullable: true })
  requiresTwoFactor: boolean | null;

  @Field(() => String, { nullable: true })
  twoFactorToken: string | null;
}

