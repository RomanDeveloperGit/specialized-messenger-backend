import { Expose } from 'class-transformer';

import { Message as _Message } from '@/shared/modules/generated/prisma/client';

export class Message implements _Message {
  @Expose()
  id: string;

  @Expose()
  conversationId: string;

  @Expose()
  userId: number;

  @Expose()
  content: string;

  @Expose()
  createdAt: Date;

  constructor(message: _Message) {
    Object.assign(this, message);
  }
}
