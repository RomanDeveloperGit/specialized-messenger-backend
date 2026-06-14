import { IsUUID } from 'class-validator';

import { PublicId } from '@/shared/libs/ids';

export class RemoveConversationParticipantParams {
  @IsUUID('7')
  conversationId: PublicId;

  @IsUUID('7')
  participantId: PublicId;
}
