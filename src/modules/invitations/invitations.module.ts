import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsResolver } from './invitations.resolver';
import { PrismaService } from '../../database/prisma.service';
import { EmailModule } from '../email/email.module';
import { RolesModule } from '../roles/roles.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    EmailModule,
    RolesModule,
    JwtModule,
    ConfigModule,
  ],
  providers: [
    InvitationsService,
    InvitationsResolver,
    PrismaService,
  ],
  exports: [InvitationsService],
})
export class InvitationsModule {}
