import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { UserId } from '@/modules/user/dto/user.dto';

import { Message as _Message, MessageType } from '@/shared/modules/generated/prisma/client';

import { ConversationId, MessageId } from './types.dto';

export type SenderId = UserId | null;

export class Message implements _Message {
  @Expose()
  id: MessageId;

  @Expose()
  conversationId: ConversationId;

  @Expose()
  senderId: SenderId;

  @Expose()
  @ApiProperty({
    enum: MessageType,
    example: MessageType.TEXT,
  })
  type: MessageType;

  @Expose()
  content: string;

  @Expose()
  createdAt: Date;

  constructor(message: _Message) {
    Object.assign(this, message);
  }
}
