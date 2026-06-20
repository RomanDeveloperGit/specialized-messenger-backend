import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { Id } from '@/shared/libs/ids';
import {
  PushSubscriptionStatus as _PushSubscriptionStatus,
  PushSubscriptionStatusName,
} from '@/shared/modules/generated/prisma/client';

export class PushSubscriptionStatus implements Omit<_PushSubscriptionStatus, 'id'> {
  @Expose()
  id: Id;

  @Expose()
  @ApiProperty({
    enum: PushSubscriptionStatusName,
  })
  name: PushSubscriptionStatusName;

  @Expose()
  createdAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(pushSubscriptionStatus: _PushSubscriptionStatus) {
    Object.assign(this, {
      ...pushSubscriptionStatus,
      id: pushSubscriptionStatus.id.toString(),
    });
  }
}
