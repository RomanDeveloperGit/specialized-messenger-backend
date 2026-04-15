import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { User } from '@/modules/user/dto/user.dto';

import { Id } from '@/shared/libs/ids';
import { ConversationParticipant as _ConversationParticipant } from '@/shared/modules/generated/prisma/client';
import {
  ConversationParticipantGetPayload,
  ConversationParticipantInclude,
} from '@/shared/modules/generated/prisma/models';

import { ConversationParticipantRole } from './conversation-participant-role.dto';

const conversationParticipantInclude = {
  user: {
    include: {
      role: true,
    },
  },
  role: true,
} satisfies ConversationParticipantInclude;

type PopulatedConversationParticipant = ConversationParticipantGetPayload<{
  include: typeof conversationParticipantInclude;
}>;

export class ConversationParticipant implements Omit<
  _ConversationParticipant,
  'id' | 'conversationId' | 'userId' | 'roleId'
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
    type: ConversationParticipantRole,
  })
  role: ConversationParticipantRole;

  @Expose()
  joinedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor({ roleId, ...conversationParticipant }: PopulatedConversationParticipant) {
    Object.assign(this, {
      ...conversationParticipant,
      id: conversationParticipant.id.toString(),
      conversationId: conversationParticipant.conversationId.toString(),
      userId: conversationParticipant.userId.toString(),
      role: new ConversationParticipantRole(conversationParticipant.role),
      user: new User(conversationParticipant.user),
    });
  }
}
