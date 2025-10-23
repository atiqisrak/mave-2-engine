import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsNotEmpty, Matches } from 'class-validator';

@InputType()
export class CreateOrganizationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  domain?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  plan?: string;
}
