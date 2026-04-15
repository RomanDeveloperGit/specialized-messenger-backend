import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { Id, PublicId } from '@/shared/libs/ids';
import { Conversation as _Conversation } from '@/shared/modules/generated/prisma/client';
import {
  ConversationGetPayload,
  ConversationInclude,
} from '@/shared/modules/generated/prisma/models';

import { ConversationParticipant } from './conversation-participant.dto';
import { ConversationType } from './conversation-type.dto';
import { Message } from './message.dto';

const conversationInclude = {
  participants: {
    include: {
      user: {
        include: {
          role: true,
        },
      },
      role: true,
    },
  },
  type: true,
  messages: {
    include: {
      type: true,
    },
  },
} satisfies ConversationInclude;

type PopulatedConversation = ConversationGetPayload<{
  include: typeof conversationInclude;
}>;

export class Conversation implements Omit<_Conversation, 'id' | 'typeId'> {
  @Expose()
  id: Id;

  @Expose()
  publicId: PublicId;

  @Expose()
  name: string | null;

  @Expose()
  @ApiProperty({
    type: ConversationType,
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor({ typeId, ...conversation }: PopulatedConversation) {
    Object.assign(this, {
      ...conversation,
      id: conversation.id.toString(),
      type: new ConversationType(conversation.type),
      participants: conversation.participants.map(
        (participant) => new ConversationParticipant(participant),
      ),
      messages: conversation.messages.map((message) => new Message(message)),
    });
  }
}
