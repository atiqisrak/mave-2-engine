import { InputType, Field } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsInt,
  IsArray,
} from 'class-validator';

@InputType()
export class CreateRoleInput {
  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  organizationId?: string;

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
}

