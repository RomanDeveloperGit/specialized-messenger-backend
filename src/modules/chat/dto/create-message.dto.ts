import { UserId } from '@/modules/user/dto/user.dto';

import { ConversationId } from './types.dto';

export interface CreateMessageRequest {
  userId: UserId;
  conversationId: ConversationId;
  content: string;
}
