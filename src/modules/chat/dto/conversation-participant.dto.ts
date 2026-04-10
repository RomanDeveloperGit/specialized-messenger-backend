import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { User } from '@/modules/user/dto/user.dto';

import {
  ConversationParticipant as _ConversationParticipant,
  ParticipantRole,
} from '@/shared/modules/generated/prisma/client';
import {
  ConversationParticipantGetPayload,
  ConversationParticipantInclude,
} from '@/shared/modules/generated/prisma/models';

const conversationParticipantInclude = {
  user: true,
} satisfies ConversationParticipantInclude;

type PopulatedConversationParticipant = ConversationParticipantGetPayload<{
  include: typeof conversationParticipantInclude;
}>;

export class ConversationParticipant implements _ConversationParticipant {
  @Expose()
  id: number;

  @Expose()
  conversationId: string;

  @Expose()
  userId: number;

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
