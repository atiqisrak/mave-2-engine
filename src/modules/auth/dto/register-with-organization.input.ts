import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

@InputType()
export class RegisterWithOrganizationInput {
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

  @Field()
  @IsString()
  orgName: string;

  @Field()
  @IsString()
  orgSlug: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  orgDomain?: string;
}
