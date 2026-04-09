import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { AuthGuard } from '@/modules/auth/auth.guard';

import { ApplyInvitationRequest } from './dto/apply-invitation.dto';
import { CreateInvitationRequest } from './dto/create-invitation.dto';
import { InvitationService } from './invitation.service';

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @AuthGuard({ checkAdminRole: true })
  async create(@Body() data: CreateInvitationRequest) {
    return await this.invitationService.create(data);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.invitationService.getById(id);
  }

  @Post(':id/apply')
  async apply(@Param('id') id: string, @Body() data: ApplyInvitationRequest) {
    return await this.invitationService.apply(id, data);
  }
}
