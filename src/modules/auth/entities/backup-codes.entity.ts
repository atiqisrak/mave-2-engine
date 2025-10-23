import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class BackupCodes {
  @Field(() => [String])
  backupCodes: string[];
}
