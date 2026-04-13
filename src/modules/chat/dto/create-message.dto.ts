import { MessageType } from '@/shared/modules/generated/prisma/enums';

import { SenderId } from './message.dto';
import { ConversationId } from './types.dto';

export interface CreateMessageRequest {
  senderId: SenderId;
  conversationId: ConversationId;
  type: MessageType;
  content: string;
}
