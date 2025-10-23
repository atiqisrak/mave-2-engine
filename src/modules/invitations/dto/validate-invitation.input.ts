import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class ValidateInvitationInput {
  @Field()
  @IsString()
  token: string;
}
