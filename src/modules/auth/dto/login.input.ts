import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsUUID, IsOptional, ValidateIf } from 'class-validator';

@InputType()
export class LoginInput {
  @Field({ nullable: true })
  @ValidateIf((o) => !o.organizationSlug)
  @IsUUID()
  @IsNotEmpty()
  organizationId?: string;

  @Field({ nullable: true })
  @ValidateIf((o) => !o.organizationId)
  @IsString()
  @IsNotEmpty()
  organizationSlug?: string;

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
