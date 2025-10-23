import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { Invitation } from './entities/invitation.entity';
import { InvitationValidation, InvitationsResponse } from './entities/invitation-response.entity';
import { CreateInvitationInput } from './dto/create-invitation.input';
import { AcceptInvitationInput } from './dto/accept-invitation.input';
import { RevokeInvitationInput, ResendInvitationInput, ListInvitationsInput } from './dto/invitation-operations.input';
import { ValidateInvitationInput } from './dto/validate-invitation.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Resolver()
export class InvitationsResolver {
  constructor(private readonly invitationsService: InvitationsService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Invitation)
  async inviteUserByEmail(
    @Args('input') createInput: CreateInvitationInput,
    @CurrentUser() user: any,
  ) {
    return this.invitationsService.createEmailInvitation(
      createInput.organizationId,
      createInput.email!,
      createInput.roleId || null,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Invitation)
  async createShareableInviteLink(
    @Args('input') createInput: CreateInvitationInput,
    @CurrentUser() user: any,
  ) {
    return this.invitationsService.createShareableInvitation(
      createInput.organizationId,
      createInput.roleId || null,
      createInput.maxUses || null,
      user.id,
    );
  }

  @Public()
  @Mutation(() => Boolean)
  async acceptInvite(
    @Args('input') acceptInput: AcceptInvitationInput,
    @Context() context: any,
  ) {
    // This will be handled by AuthService.registerWithInvitation
    // This resolver is here for GraphQL schema completeness
    throw new Error('Use registerWithInvitation mutation instead');
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async revokeInvite(
    @Args('input') revokeInput: RevokeInvitationInput,
    @CurrentUser() user: any,
  ) {
    const result = await this.invitationsService.revokeInvitation(
      revokeInput.invitationId,
      user.id,
    );
    return result.success;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async resendInvite(
    @Args('input') resendInput: ResendInvitationInput,
  ) {
    const result = await this.invitationsService.resendInvitation(
      resendInput.invitationId,
    );
    return result.success;
  }

  @Public()
  @Query(() => InvitationValidation)
  async validateInvitationToken(
    @Args('input') validateInput: ValidateInvitationInput,
  ) {
    return this.invitationsService.validateInvitation(validateInput.token);
  }

  @Public()
  @Query(() => Invitation, { nullable: true })
  async getInvitation(@Args('token') token: string) {
    const validation = await this.invitationsService.validateInvitation(token);
    return validation.isValid ? validation.invitation : null;
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => InvitationsResponse)
  async listInvitations(
    @Args('input') listInput: ListInvitationsInput,
  ) {
    return this.invitationsService.listOrganizationInvitations(
      listInput.organizationId,
      listInput.status,
      listInput.skip,
      listInput.take,
    );
  }
}
