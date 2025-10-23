import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Role } from '../../roles/entities/role.entity';

@ObjectType()
export class Invitation {
  @Field(() => ID)
  id: string;

  @Field()
  organizationId: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field()
  token: string;

  @Field(() => String, { nullable: true })
  roleId?: string;

  @Field()
  invitedBy: string;

  @Field(() => String, { nullable: true })
  acceptedBy?: string;

  @Field(() => Date, { nullable: true })
  acceptedAt?: Date;

  @Field()
  expiresAt: Date;

  @Field()
  status: string;

  @Field()
  type: string;

  @Field(() => Number, { nullable: true })
  maxUses?: number;

  @Field()
  usedCount: number;

  @Field()
  createdAt: Date;

  // Relations
  @Field(() => Organization, { nullable: true })
  organization?: Organization;

  @Field(() => User, { nullable: true })
  inviter?: User;

  @Field(() => User, { nullable: true })
  accepter?: User;

  @Field(() => Role, { nullable: true })
  role?: Role;
}
