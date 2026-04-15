import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { MessageContents } from '@/modules/chat/chat.constants';

import { Id, PublicId } from '@/shared/libs/ids';
import { Message as _Message, MessageType } from '@/shared/modules/generated/prisma/client';

export class Message implements Omit<
  _Message,
  'id' | 'conversationId' | 'authorUserId' | 'content'
> {
  @Expose()
  id: Id;

  @Expose()
  publicId: PublicId;

  @Expose()
  conversationId: Id;

  @Expose()
  authorUserId: Id | null;

  @Expose()
  @ApiProperty({
    enum: MessageType,
    example: MessageType.TEXT,
  })
  type: MessageType;

  @Expose()
  @ApiProperty({
    description: 'См. типы в chat.constants.ts (MessageContents)',
  })
  content: MessageContents;

  @Expose()
  createdAt: Date;

  constructor(message: _Message) {
    Object.assign(this, {
      ...message,
      id: message.id.toString(),
      conversationId: message.conversationId.toString(),
      authorUserId: message.authorUserId?.toString() || null,
      content: JSON.parse(message.content),
    });
  }
}
