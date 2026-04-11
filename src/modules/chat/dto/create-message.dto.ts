import { UserId } from '@/modules/user/dto/user.dto';

import { ConversationId } from './conversation.dto';

export interface CreateMessageRequest {
  userId: UserId;
  conversationId: ConversationId;
  content: string;
}
