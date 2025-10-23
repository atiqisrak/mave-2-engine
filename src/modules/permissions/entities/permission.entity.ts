import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class Permission {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field()
  module: string;

  @Field(() => String, { nullable: true })
  category: string | null;

  @Field()
  permissionType: string;

  @Field(() => [String])
  dependsOn: string[];

  @Field(() => [String])
  conflictsWith: string[];

  @Field()
  riskLevel: string;

  @Field()
  requiresMfa: boolean;

  @Field()
  requiresApproval: boolean;

  @Field()
  isSystem: boolean;

  @Field()
  isActive: boolean;

  @Field()
  isDeprecated: boolean;

  @Field(() => GraphQLJSON)
  metadata: Record<string, any>;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

