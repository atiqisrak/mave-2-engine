import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { Role } from '../../roles/entities/role.entity';

@ObjectType()
export class UserRoleWithDetails {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  roleId: string;

  @Field()
  scope: string;

  @Field(() => String, { nullable: true })
  resourceType: string | null;

  @Field(() => String, { nullable: true })
  resourceId: string | null;

  @Field(() => GraphQLJSON)
  conditions: Record<string, any>;

  @Field()
  startsAt: Date;

  @Field(() => Date, { nullable: true })
  expiresAt: Date | null;

  @Field(() => String, { nullable: true })
  assignedBy: string | null;

  @Field(() => String, { nullable: true })
  assignedReason: string | null;

  @Field()
  assignedAt: Date;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field(() => Role)
  role: Role;
}
