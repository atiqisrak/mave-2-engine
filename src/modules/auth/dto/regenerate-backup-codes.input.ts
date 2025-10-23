import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class RegenerateBackupCodesInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;
}

