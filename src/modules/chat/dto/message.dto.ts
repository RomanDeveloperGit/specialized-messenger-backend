import { Expose } from 'class-transformer';

import { UserId } from '@/modules/user/dto/user.dto';

import { Message as _Message } from '@/shared/modules/generated/prisma/client';

import { ConversationId, MessageId } from './types.dto';

export class Message implements _Message {
  @Expose()
  id: MessageId;

  @Expose()
  conversationId: ConversationId;

  @Expose()
  userId: UserId;

  @Expose()
  content: string;

  @Expose()
  createdAt: Date;

  constructor(message: _Message) {
    Object.assign(this, message);
  }
}
