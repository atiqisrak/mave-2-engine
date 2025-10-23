import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class Disable2FAInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;
}

