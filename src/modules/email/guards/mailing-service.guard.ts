import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class MailingServiceGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const mailingService = this.configService.get<string>('MAILING_SERVICE', 'enabled');

    if (mailingService.toLowerCase() !== 'enabled') {
      // For GraphQL context, we need to get the GraphQL context
      const gqlContext = GqlExecutionContext.create(context);
      const info = gqlContext.getInfo();

      throw new ForbiddenException(
        `Mailing service is disabled. Cannot execute ${info.fieldName} mutation.`,
      );
    }

    return true;
  }
}
