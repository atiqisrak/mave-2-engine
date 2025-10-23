import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  organizationId: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  username: string | null;

  @Field(() => String, { nullable: true })
  firstName: string | null;

  @Field(() => String, { nullable: true })
  lastName: string | null;

  @Field(() => String, { nullable: true })
  phone: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;

  @Field(() => String, { nullable: true })
  bio: string | null;

  @Field(() => Date, { nullable: true })
  emailVerifiedAt: Date | null;

  @Field()
  twoFactorEnabled: boolean;

  @Field(() => Date, { nullable: true })
  lastLoginAt: Date | null;

  @Field(() => String, { nullable: true })
  lastLoginIp: string | null;

  @Field(() => Date, { nullable: true })
  lastActivityAt: Date | null;

  @Field()
  status: string;

  @Field()
  isSystem: boolean;

  @Field()
  timezone: string;

  @Field()
  locale: string;

  @Field(() => GraphQLJSON)
  preferences: Record<string, any>;

  @Field(() => GraphQLJSON)
  metadata: Record<string, any>;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt: Date | null;
}

