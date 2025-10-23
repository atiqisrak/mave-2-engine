import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class Role {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  organizationId: string | null;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String, { nullable: true })
  parentRoleId: string | null;

  @Field(() => Int)
  level: number;

  @Field()
  roleType: string;

  @Field()
  isSystem: boolean;

  @Field()
  isAssignable: boolean;

  @Field()
  isDefault: boolean;

  @Field(() => [String])
  permissions: string[];

  @Field(() => String, { nullable: true })
  color: string | null;

  @Field(() => String, { nullable: true })
  icon: string | null;

  @Field(() => Int)
  priority: number;

  @Field(() => GraphQLJSON)
  metadata: Record<string, any>;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt: Date | null;
}

