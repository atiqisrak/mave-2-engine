import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class TwoFactorStatus {
  @Field()
  enabled: boolean;

  @Field(() => Int)
  backupCodesRemaining: number;
}

