import { IsUUID } from 'class-validator';

import { PublicId } from '@/shared/libs/ids';

export class AddConversationParticipantParams {
  @IsUUID('7')
  id: PublicId;
}

export class AddConversationParticipantRequest {
  @IsUUID('7')
  userId: PublicId;
}
