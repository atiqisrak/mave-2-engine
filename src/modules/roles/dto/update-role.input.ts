import { InputType, Field } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-scalars';

@InputType()
export class UpdateRoleInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  parentRoleId?: string;

  @Field({ nullable: true })
  @IsInt()
  @IsOptional()
  level?: number;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  permissions?: string[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  color?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  icon?: string;

  @Field({ nullable: true })
  @IsInt()
  @IsOptional()
  priority?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isAssignable?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

