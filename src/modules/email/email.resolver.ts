import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver()
export class EmailResolver {
  constructor(private readonly emailService: EmailService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async sendTestEmail(@Args('email') email: string) {
    await this.emailService.sendTestEmail(email);
    return true;
  }
}

