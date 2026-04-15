import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { Id } from '@/shared/libs/ids';
import {
  ConversationType as _ConversationType,
  ConversationTypeName,
} from '@/shared/modules/generated/prisma/client';

export class ConversationType implements Omit<_ConversationType, 'id'> {
  @Expose()
  id: Id;

  @Expose()
  @ApiProperty({
    enum: ConversationTypeName,
  })
  name: ConversationTypeName;

  @Expose()
  createdAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(conversationType: _ConversationType) {
    Object.assign(this, {
      ...conversationType,
      id: conversationType.id.toString(),
    });
  }
}
