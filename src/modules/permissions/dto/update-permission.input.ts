import { InputType, Field } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-scalars';

@InputType()
export class UpdatePermissionInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  category?: string;

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

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isDeprecated?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

