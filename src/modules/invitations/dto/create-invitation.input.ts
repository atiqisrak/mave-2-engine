import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, IsUUID, IsInt, Min, Max } from 'class-validator';

@InputType()
export class CreateInvitationInput {
  @Field()
  @IsUUID()
  organizationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxUses?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  expiresInDays?: number;
}
