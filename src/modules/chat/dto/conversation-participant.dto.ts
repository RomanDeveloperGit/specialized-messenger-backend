import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { User } from '@/modules/user/dto/user.dto';

import { Id } from '@/shared/libs/ids';
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

export class ConversationParticipant implements Omit<
  _ConversationParticipant,
  'id' | 'conversationId' | 'userId'
> {
  @Expose()
  id: Id;

  @Expose()
  conversationId: Id;

  @Expose()
  userId: Id;

  @Expose()
  @ApiProperty({
    type: User,
  })
  user: User;

  @Expose()
  @ApiProperty({
    enum: ParticipantRole,
    example: ParticipantRole.MEMBER,
  })
  role: ParticipantRole;

  @Expose()
  joinedAt: Date;

  constructor(conversationParticipant: PopulatedConversationParticipant) {
    Object.assign(this, {
      ...conversationParticipant,
      id: conversationParticipant.id.toString(),
      conversationId: conversationParticipant.conversationId.toString(),
      userId: conversationParticipant.userId.toString(),
      user: new User(conversationParticipant.user),
    });
  }
}
