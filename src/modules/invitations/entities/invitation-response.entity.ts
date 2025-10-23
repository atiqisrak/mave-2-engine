import { ObjectType, Field } from '@nestjs/graphql';
import { Invitation } from './invitation.entity';

@ObjectType()
export class InvitationValidation {
  @Field()
  isValid: boolean;

  @Field({ nullable: true })
  invitation?: Invitation;

  @Field({ nullable: true })
  error?: string;
}

@ObjectType()
export class InvitationsResponse {
  @Field(() => [Invitation])
  invitations: Invitation[];

  @Field()
  total: number;
}
