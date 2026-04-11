import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { AuthGuard } from '@/modules/auth/auth.guard';

import { ApplyInvitationParams, ApplyInvitationRequest } from './dto/apply-invitation.dto';
import { CreateInvitationRequest } from './dto/create-invitation.dto';
import { GetInvitationByIdParams } from './dto/get-invitation-by-id.dto';
import { InvitationService } from './invitation.service';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @AuthGuard({ checkAdminRole: true })
  async create(@Body() data: CreateInvitationRequest) {
    return await this.invitationService.create(data);
  }

  @Get(':id')
  async getById(@Param() { id }: GetInvitationByIdParams) {
    return await this.invitationService.getById(id);
  }

  @Post(':id/apply')
  async apply(@Param() { id }: ApplyInvitationParams, @Body() data: ApplyInvitationRequest) {
    return await this.invitationService.apply(id, data);
  }
}
