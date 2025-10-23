import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  emailOrUsername: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  twoFactorCode?: string;
}

