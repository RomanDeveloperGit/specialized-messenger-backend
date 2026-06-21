import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBasicAuth } from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest } from '../auth/auth.types';
import { CreatePushSubscriptionRequest } from './dto/create-push-subscription.dto';
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
  async create(@Req() req: AuthorizedRequest, @Body() body: CreatePushSubscriptionRequest) {
    return this.pushSubscriptionService.create(req.user.id, body);
  }

  @Patch('mark-as-unsubscribed')
  async markAsUnsubscribed(@Body() body: MarkAsUnsubscribedPushSubscriptionRequest) {
    return this.pushSubscriptionService.markAsUnsubscribed(body);
  }
}
