import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsUUID, ValidateIf } from 'class-validator';

@InputType()
export class RegisterInput {
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
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  username?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  firstName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;
}
