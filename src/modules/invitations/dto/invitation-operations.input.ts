import { Field, InputType } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsString } from 'class-validator';

@InputType()
export class RevokeInvitationInput {
  @Field()
  @IsUUID()
  invitationId: string;
}

@InputType()
export class ResendInvitationInput {
  @Field()
  @IsUUID()
  invitationId: string;
}

@InputType()
export class ListInvitationsInput {
  @Field()
  @IsUUID()
  organizationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true, defaultValue: 0 })
  @IsOptional()
  skip?: number;

  @Field({ nullable: true, defaultValue: 20 })
  @IsOptional()
  take?: number;
}
