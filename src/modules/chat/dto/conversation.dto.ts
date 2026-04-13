import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

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
import { ConversationId } from './types.dto';

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

export class Conversation implements _Conversation {
  @Expose()
  id: ConversationId;

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
      participants: conversation.participants.map(
        (participant) => new ConversationParticipant(participant),
      ),
      messages: conversation.messages.map((message) => new Message(message)),
    });
  }
}
