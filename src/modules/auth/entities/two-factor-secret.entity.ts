import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class TwoFactorSecret {
  @Field()
  secret: string;

  @Field()
  qrCode: string;

  @Field()
  otpauthUrl: string;
}

