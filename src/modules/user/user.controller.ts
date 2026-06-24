import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBasicAuth } from '@nestjs/swagger';

import { AuthGuard, AuthOptions } from '@/modules/auth/auth.guard';

import { AuthorizedRequest } from '../auth/auth.types';
import { UpdateNotificationsStatusRequest } from './dto/update-notifications-status.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @AuthOptions({ checkAdminRole: true })
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  async getAll() {
    return await this.userService.getAll();
  }

  @Patch('/notifications')
  @AuthOptions({ checkAdminRole: true })
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  async updateNotifictionsStatus(
    @Req() request: AuthorizedRequest,
    @Body() body: UpdateNotificationsStatusRequest,
  ) {
    return await this.userService.updateNotifictionsStatus(request.user.id, body);
  }
}
