import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class Verify2FAInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  twoFactorToken: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  code: string;
}
