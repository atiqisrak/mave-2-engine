import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class Enable2FAInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  token: string;
}
