import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBasicAuth } from '@nestjs/swagger';

import { AuthGuard, AuthOptions } from '@/modules/auth/auth.guard';

import { AuthorizedRequest } from '../auth/auth.types';
import {
  AcceptInvitationByPublicIdParams,
  AcceptInvitationByPublicIdRequest,
} from './dto/accept-invitation-by-public-id.dto';
import { CreateInvitationRequest } from './dto/create-invitation.dto';
import { GetInvitationByPublicIdParams } from './dto/get-invitation-by-public-id.dto';
import { InvitationService } from './invitation.service';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @AuthOptions({ checkAdminRole: true })
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  async create(@Body() data: CreateInvitationRequest, @Req() req: AuthorizedRequest) {
    return await this.invitationService.create(data, req.user.id);
  }

  @Get(':id')
  async getByPublicId(@Param() { id: publicId }: GetInvitationByPublicIdParams) {
    return await this.invitationService.getByPublicId(publicId);
  }

  @Post(':id/accept')
  async acceptByPublicId(
    @Param() { id: publicId }: AcceptInvitationByPublicIdParams,
    @Body() data: AcceptInvitationByPublicIdRequest,
  ) {
    return await this.invitationService.acceptByPublicId(publicId, data);
  }
}
