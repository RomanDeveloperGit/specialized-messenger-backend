import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { Id } from '@/shared/libs/ids';
import {
  MessageType as _MessageType,
  MessageTypeName,
} from '@/shared/modules/generated/prisma/client';

export class MessageType implements Omit<_MessageType, 'id'> {
  @Expose()
  id: Id;

  @Expose()
  @ApiProperty({
    enum: MessageTypeName,
  })
  name: MessageTypeName;

  @Expose()
  createdAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(messageType: _MessageType) {
    Object.assign(this, {
      ...messageType,
      id: messageType.id.toString(),
    });
  }
}
