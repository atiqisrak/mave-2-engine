import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsResolver } from './organizations.resolver';
import { SubdomainService } from './services/subdomain.service';
import { PrismaService } from '../../database/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [OrganizationsResolver, OrganizationsService, SubdomainService, PrismaService],
  exports: [OrganizationsService, SubdomainService],
})
export class OrganizationsModule {}
