import { Body, Controller, Delete, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBasicAuth } from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest } from '../auth/auth.types';
import { CreatePushSubscriptionRequest } from './dto/create-push-subscription.dto';
import { DeletePushSubscriptionQuery } from './dto/delete-push-subscription.dto';
import { PushSubscriptionService } from './push-subscription.service';

@Controller('push-subscriptions')
export class PushSubscriptionController {
  constructor(private readonly pushSubscriptionService: PushSubscriptionService) {}

  @Get('vapid-public-key')
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  getVapidPublicKey() {
    return this.pushSubscriptionService.getVapidPublicKey();
  }

  @Post()
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  async create(@Req() req: AuthorizedRequest, @Body() body: CreatePushSubscriptionRequest) {
    return this.pushSubscriptionService.create(req.user.id, body);
  }

  @Get()
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  async getActiveSubscriptions(@Req() req: AuthorizedRequest) {
    return this.pushSubscriptionService.getActiveSubscriptionsByUserId(req.user.id);
  }

  @Delete()
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  async delete(@Req() req: AuthorizedRequest, @Query() query: DeletePushSubscriptionQuery) {
    return this.pushSubscriptionService.delete(req.user.id, query.endpoint);
  }
}
