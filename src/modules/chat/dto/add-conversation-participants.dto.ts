import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

import { PublicId } from '@/shared/libs/ids';

export class AddConversationParticipantsParams {
  @IsUUID('7')
  id: PublicId;
}

export class AddConversationParticipantsRequest {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('7', { each: true })
  userIds: PublicId[];
}
