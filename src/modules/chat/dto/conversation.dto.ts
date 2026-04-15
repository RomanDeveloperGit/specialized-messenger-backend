import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { Id, PublicId } from '@/shared/libs/ids';
import {
  Conversation as _Conversation,
  ConversationType,
} from '@/shared/modules/generated/prisma/client';
import {
  ConversationGetPayload,
  ConversationInclude,
} from '@/shared/modules/generated/prisma/models';

import { ConversationParticipant } from './conversation-participant.dto';
import { Message } from './message.dto';

const conversationInclude = {
  participants: {
    include: {
      user: true,
    },
  },
  messages: true,
} satisfies ConversationInclude;

type PopulatedConversation = ConversationGetPayload<{
  include: typeof conversationInclude;
}>;

export class Conversation implements Omit<_Conversation, 'id'> {
  @Expose()
  id: Id;

  @Expose()
  publicId: PublicId;

  @Expose()
  name: string | null;

  @Expose()
  @ApiProperty({
    enum: ConversationType,
    example: ConversationType.DIRECT,
  })
  type: ConversationType;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @ApiProperty({
    type: [ConversationParticipant],
  })
  participants: ConversationParticipant[];

  @Expose()
  @ApiProperty({
    type: [Message],
  })
  messages: Message[];

  constructor(conversation: PopulatedConversation) {
    Object.assign(this, {
      ...conversation,
      id: conversation.id.toString(),
      participants: conversation.participants.map(
        (participant) => new ConversationParticipant(participant),
      ),
      messages: conversation.messages.map((message) => new Message(message)),
    });
  }
}
