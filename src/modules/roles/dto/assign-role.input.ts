import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { GraphQLJSON } from 'graphql-scalars';

@InputType()
export class AssignRoleInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  scope?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  resourceType?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  resourceId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  conditions?: Record<string, any>;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  expiresAt?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  assignedReason?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
