import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PermissionsService } from './permissions.service';
import { PermissionsResolver } from './permissions.resolver';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    RolesModule,
    CacheModule.register({
      ttl: 300000, // 5 minutes
      max: 1000, // max items in cache
    }),
  ],
  providers: [PermissionsResolver, PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}

