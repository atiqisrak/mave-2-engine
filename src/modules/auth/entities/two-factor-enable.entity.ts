import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class TwoFactorEnable {
  @Field()
  enabled: boolean;

  @Field(() => [String])
  backupCodes: string[];
}

