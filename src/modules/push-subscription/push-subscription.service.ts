import { Injectable, OnModuleInit } from '@nestjs/common';

import { uuidv7 } from 'uuidv7';

import * as webPush from 'web-push';

import { Id } from '@/shared/libs/ids';
import { PushNotificationPayload } from '@/shared/libs/push-notification';
import { ConfigService } from '@/shared/modules/config';
import { PushSubscriptionStatusName } from '@/shared/modules/generated/prisma/client';
import { PrismaService } from '@/shared/modules/prisma';

import { CreatePushSubscriptionRequest } from './dto/create-push-subscription.dto';
import { GetPushSubscriptionByDataQuery } from './dto/get-push-subscription-by-data.dto';
import { MarkAsUnsubscribedPushSubscriptionRequest } from './dto/mark-as-unsubscribed-push-subscription.dto';
import { PushSubscription } from './dto/push-subscription.dto';
@Injectable()
export class PushSubscriptionService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    webPush.setVapidDetails(
      this.configService.get('vapidSubject'),
      this.configService.get('vapidPublicKey'),
      this.configService.get('vapidPrivateKey'),
    );
  }

  getVapidPublicKey(): string {
    return this.configService.get('vapidPublicKey');
  }

  async create(userId: Id, data: CreatePushSubscriptionRequest, userAgent: string) {
    const { id: activeStatusId } =
      await this.prismaService.pushSubscriptionStatus.findUniqueOrThrow({
        where: { name: PushSubscriptionStatusName.ACTIVE },
        select: { id: true },
      });

    const commonData = {
      userId: BigInt(userId),
      statusId: activeStatusId,
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
      expirationTime: data.expirationTime ? new Date(data.expirationTime) : null,
      userAgent,
    };

    const subscription = await this.prismaService.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      create: {
        publicId: uuidv7(),
        endpoint: data.endpoint,
        ...commonData,
      },
      update: commonData,
      include: {
        status: true,
      },
    });

    return new PushSubscription(subscription);
  }

  async getActiveSubscriptionsByUserId(userId: Id) {
    const subscriptions = await this.prismaService.pushSubscription.findMany({
      where: {
        userId: BigInt(userId),
        status: { name: PushSubscriptionStatusName.ACTIVE },
      },
      include: {
        status: true,
      },
    });

    return subscriptions.map((subscription) => new PushSubscription(subscription));
  }

  async getByData(userId: Id, query: GetPushSubscriptionByDataQuery) {
    const subscription = await this.prismaService.pushSubscription.findFirstOrThrow({
      where: {
        userId: BigInt(userId),
        endpoint: query.endpoint,
        p256dh: query.p256dh,
        auth: query.auth,
        expirationTime: query.expirationTime ? new Date(query.expirationTime) : null,
      },
      include: {
        status: true,
      },
    });

    return new PushSubscription(subscription);
  }

  async markAsUnsubscribed(data: MarkAsUnsubscribedPushSubscriptionRequest) {
    const { id: unsubscribedStatusId } =
      await this.prismaService.pushSubscriptionStatus.findUniqueOrThrow({
        where: { name: PushSubscriptionStatusName.UNSUBSCRIBED },
        select: { id: true },
      });

    const subscription = await this.prismaService.pushSubscription.update({
      where: {
        endpoint: data.endpoint,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
      },
      data: {
        statusId: unsubscribedStatusId,
      },
      include: {
        status: true,
      },
    });

    return new PushSubscription(subscription);
  }

  async sendToUser(userId: Id, payload: PushNotificationPayload) {
    const subscriptions = await this.getActiveSubscriptionsByUserId(userId);

    await Promise.allSettled(
      subscriptions.map((subscription) => this.sendToSubscription(subscription, payload)),
    );
  }

  async sendToUsers(userIds: Id[], payload: PushNotificationPayload): Promise<void> {
    const allSubscriptions = await this.prismaService.pushSubscription.findMany({
      where: {
        userId: { in: userIds.map(BigInt) },
        status: { name: PushSubscriptionStatusName.ACTIVE },
      },
      include: {
        status: true,
      },
    });

    await Promise.allSettled(
      allSubscriptions.map((subscription) =>
        this.sendToSubscription(new PushSubscription(subscription), payload),
      ),
    );
  }

  private async sendToSubscription(
    subscription: PushSubscription,
    payload: PushNotificationPayload,
  ) {
    try {
      await webPush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        JSON.stringify(payload),
      );
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;

      if (statusCode === 404 || statusCode === 410) {
        await this.markAsExpired(subscription.id);
      }
    }
  }

  private async markAsExpired(subscriptionId: Id) {
    const { id: expiredStatusId } =
      await this.prismaService.pushSubscriptionStatus.findUniqueOrThrow({
        where: { name: PushSubscriptionStatusName.EXPIRED },
        select: { id: true },
      });

    await this.prismaService.pushSubscription.update({
      where: { id: BigInt(subscriptionId) },
      data: { statusId: expiredStatusId },
    });
  }
}
