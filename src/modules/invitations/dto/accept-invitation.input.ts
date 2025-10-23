import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsEmail, IsOptional, IsUUID, MinLength } from 'class-validator';

@InputType()
export class AcceptInvitationInput {
  @Field()
  @IsString()
  token: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  password: string;

  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  username?: string;
}
