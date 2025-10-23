import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TwoFactorService } from './services/two-factor.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { TwoFactorSecret } from './entities/two-factor-secret.entity';
import { TwoFactorEnable } from './entities/two-factor-enable.entity';
import { TwoFactorStatus } from './entities/two-factor-status.entity';
import { BackupCodes } from './entities/backup-codes.entity';
import { Enable2FAInput } from './dto/enable-2fa.input';
import { Disable2FAInput } from './dto/disable-2fa.input';
import { RegenerateBackupCodesInput } from './dto/regenerate-backup-codes.input';

@Resolver()
export class TwoFactorResolver {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => TwoFactorSecret)
  async generate2FASecret(@CurrentUser() user: any) {
    return this.twoFactorService.generateSecret(user.id, user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => TwoFactorEnable)
  async enable2FA(@CurrentUser() user: any, @Args('input') input: Enable2FAInput) {
    return this.twoFactorService.verifyAndEnable(user.id, input.token);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async disable2FA(@CurrentUser() user: any, @Args('input') input: Disable2FAInput) {
    const result = await this.twoFactorService.disable(user.id, input.password);
    return result.disabled;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => BackupCodes)
  async regenerate2FABackupCodes(
    @CurrentUser() user: any,
    @Args('input') input: RegenerateBackupCodesInput,
  ) {
    return this.twoFactorService.regenerateBackupCodes(user.id, input.password);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => TwoFactorStatus)
  async twoFactorStatus(@CurrentUser() user: any) {
    return this.twoFactorService.getStatus(user.id);
  }
}
