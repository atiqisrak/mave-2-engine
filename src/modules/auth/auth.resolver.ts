import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponse } from './entities/auth-response.entity';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthResponse)
  async register(@Args('input') registerInput: RegisterInput) {
    return this.authService.register(registerInput);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async login(@Args('input') loginInput: LoginInput, @Context() context: any) {
    const ipAddress = context.req?.ip || context.req?.connection?.remoteAddress;
    return this.authService.login(loginInput, ipAddress);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async refreshToken(@Args('input') refreshInput: RefreshTokenInput) {
    return this.authService.refreshToken(refreshInput.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async logout(@CurrentUser() user: any) {
    await this.authService.logout(user.id);
    return true;
  }

  @Public()
  @Mutation(() => Boolean)
  async requestPasswordReset(
    @Args('organizationId') organizationId: string,
    @Args('email') email: string,
  ) {
    await this.authService.requestPasswordReset(organizationId, email);
    return true;
  }

  @Public()
  @Mutation(() => Boolean)
  async resetPassword(
    @Args('resetToken') resetToken: string,
    @Args('newPassword') newPassword: string,
  ) {
    await this.authService.resetPassword(resetToken, newPassword);
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean)
  async validateToken() {
    return true;
  }
}
