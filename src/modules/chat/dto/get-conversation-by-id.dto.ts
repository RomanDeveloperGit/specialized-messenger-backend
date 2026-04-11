import { IsUUID } from 'class-validator';

import { ConversationId } from './conversation.dto';

export class GetConversationByIdParams {
  @IsUUID()
  id: ConversationId;
}
