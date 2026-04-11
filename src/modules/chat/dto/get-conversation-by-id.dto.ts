import { IsUUID } from 'class-validator';

import { ConversationId } from './types.dto';

export class GetConversationByIdParams {
  @IsUUID()
  id: ConversationId;
}
