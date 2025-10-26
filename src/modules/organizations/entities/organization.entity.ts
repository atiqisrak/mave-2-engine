import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class OrganizationCount {
  @Field(() => Number)
  users: number;
}

@ObjectType()
export class Organization {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => String, { nullable: true })
  domain: string | null;

  @Field()
  plan: string;

  @Field(() => GraphQLJSON)
  settings: Record<string, any>;

  @Field(() => GraphQLJSON)
  branding: Record<string, any>;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt: Date | null;

  @Field(() => OrganizationCount, { nullable: true })
  _count?: OrganizationCount;
}
