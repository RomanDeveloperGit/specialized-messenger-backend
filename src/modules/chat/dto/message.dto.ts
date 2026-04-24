import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { MessageContents } from '@/modules/chat/chat.constants';
import { User } from '@/modules/user/dto/user.dto';

import { Id, PublicId } from '@/shared/libs/ids';
import { Message as _Message } from '@/shared/modules/generated/prisma/client';
import { MessageGetPayload, MessageInclude } from '@/shared/modules/generated/prisma/models';

import { MessageType } from './message-type.dto';

const messageInclude = {
  type: true,
  author: {
    include: {
      role: true,
    },
  },
} satisfies MessageInclude;

type PopulatedMessage = MessageGetPayload<{
  include: typeof messageInclude;
}>;

export class Message implements Omit<
  _Message,
  'id' | 'conversationId' | 'authorUserId' | 'content' | 'typeId'
> {
  @Expose()
  id: Id;

  @Expose()
  publicId: PublicId;

  @Expose()
  conversationId: Id;

  @Expose()
  @ApiProperty({
    type: User,
  })
  author: User | null;

  @Expose()
  @ApiProperty({
    type: MessageType,
  })
  type: MessageType;

  @Expose()
  @ApiProperty({
    description: 'См. типы в chat.constants.ts (MessageContents)',
  })
  content: MessageContents;

  @Expose()
  createdAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor({ typeId, authorUserId, ...message }: PopulatedMessage) {
    Object.assign(this, {
      ...message,
      id: message.id.toString(),
      conversationId: message.conversationId.toString(),
      author: message.author ? new User(message.author) : null,
      type: new MessageType(message.type),
      content: JSON.parse(message.content),
    });
  }
}
