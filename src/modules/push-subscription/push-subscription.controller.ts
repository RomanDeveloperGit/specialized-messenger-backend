import { Body, Controller, Get, Headers, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBasicAuth } from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest } from '../auth/auth.types';
import { CreatePushSubscriptionRequest } from './dto/create-push-subscription.dto';
import { GetPushSubscriptionByDataQuery } from './dto/get-push-subscription-by-data.dto';
import { MarkAsUnsubscribedPushSubscriptionRequest } from './dto/mark-as-unsubscribed-push-subscription.dto';
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
  async create(
    @Req() req: AuthorizedRequest,
    @Body() body: CreatePushSubscriptionRequest,
    @Headers('User-Agent') userAgent: string,
  ) {
    return this.pushSubscriptionService.create(req.user.id, body, userAgent);
  }

  @Get()
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  async getActiveSubscriptionsByUserId(@Req() req: AuthorizedRequest) {
    return this.pushSubscriptionService.getActiveSubscriptionsByUserId(req.user.id);
  }

  @Get()
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  async getByData(@Req() req: AuthorizedRequest, @Query() query: GetPushSubscriptionByDataQuery) {
    return this.pushSubscriptionService.getByData(req.user.id, query);
  }

  @Patch('mark-as-unsubscribed')
  async markAsUnsubscribed(@Body() body: MarkAsUnsubscribedPushSubscriptionRequest) {
    return this.pushSubscriptionService.markAsUnsubscribed(body);
  }

  @Get('/ttt')
  async test() {
    return this.pushSubscriptionService.sendToAll();
  }
}
