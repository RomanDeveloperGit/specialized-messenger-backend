import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { Id } from '@/shared/libs/ids';
import {
  ConversationParticipantRole as _ConversationParticipantRole,
  ConversationParticipantRoleName,
} from '@/shared/modules/generated/prisma/client';

export class ConversationParticipantRole implements Omit<_ConversationParticipantRole, 'id'> {
  @Expose()
  id: Id;

  @Expose()
  @ApiProperty({
    enum: ConversationParticipantRoleName,
  })
  name: ConversationParticipantRoleName;

  @Expose()
  createdAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(conversationParticipantRole: _ConversationParticipantRole) {
    Object.assign(this, {
      ...conversationParticipantRole,
      id: conversationParticipantRole.id.toString(),
    });
  }
}
