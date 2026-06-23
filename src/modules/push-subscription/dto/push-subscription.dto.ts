import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { Id, PublicId } from '@/shared/libs/ids';
import { PushSubscription as _PushSubscription } from '@/shared/modules/generated/prisma/client';
import {
  PushSubscriptionGetPayload,
  PushSubscriptionInclude,
} from '@/shared/modules/generated/prisma/models';

import { PushSubscriptionStatus } from './push-subscription-status.dto';

const pushSubscriptionInclude = {
  status: true,
} satisfies PushSubscriptionInclude;

type PopulatedPushSubscription = PushSubscriptionGetPayload<{
  include: typeof pushSubscriptionInclude;
}>;

export class PushSubscription implements Omit<_PushSubscription, 'id' | 'userId' | 'statusId'> {
  @Expose()
  id: Id;

  @Expose()
  publicId: PublicId;

  @Expose()
  userId: Id;

  @Expose()
  @ApiProperty({
    type: PushSubscriptionStatus,
  })
  status: PushSubscriptionStatus;

  @Expose()
  endpoint: string;

  @Expose()
  userAgent: string;

  @Expose()
  p256dh: string;

  @Expose()
  auth: string;

  @Expose()
  expirationTime: Date | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor({ statusId, ...pushSubscription }: PopulatedPushSubscription) {
    Object.assign(this, {
      ...pushSubscription,
      id: pushSubscription.id.toString(),
      userId: pushSubscription.userId.toString(),
      status: new PushSubscriptionStatus(pushSubscription.status),
    });
  }
}
