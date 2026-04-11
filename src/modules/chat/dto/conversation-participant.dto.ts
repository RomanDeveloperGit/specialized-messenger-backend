import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { User, UserId } from '@/modules/user/dto/user.dto';

import {
  ConversationParticipant as _ConversationParticipant,
  ParticipantRole,
} from '@/shared/modules/generated/prisma/client';
import {
  ConversationParticipantGetPayload,
  ConversationParticipantInclude,
} from '@/shared/modules/generated/prisma/models';

import { ConversationId } from './conversation.dto';

const conversationParticipantInclude = {
  user: true,
} satisfies ConversationParticipantInclude;

type PopulatedConversationParticipant = ConversationParticipantGetPayload<{
  include: typeof conversationParticipantInclude;
}>;

export type ConversationParticipantId = _ConversationParticipant['id'];

export class ConversationParticipant implements _ConversationParticipant {
  @Expose()
  id: ConversationParticipantId;

  @Expose()
  conversationId: ConversationId;

  @Expose()
  userId: UserId;

  @Expose()
  @ApiProperty({
    type: User,
  })
  user: User;

  @Expose()
  @ApiProperty({
    enum: ParticipantRole,
  })
  role: ParticipantRole;

  @Expose()
  joinedAt: Date;

  constructor(conversationParticipant: PopulatedConversationParticipant) {
    Object.assign(this, {
      ...conversationParticipant,
      user: new User(conversationParticipant.user),
    });
  }
}
