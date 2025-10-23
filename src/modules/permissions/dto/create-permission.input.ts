import { InputType, Field } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

@InputType()
export class CreatePermissionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  module: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  category?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  permissionType?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  dependsOn?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  conflictsWith?: string[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  riskLevel?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  requiresMfa?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;
}

