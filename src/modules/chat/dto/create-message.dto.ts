import { MessageTypeWithContent } from '@/modules/chat/chat.constants';

import { SenderId } from './message.dto';
import { ConversationId } from './types.dto';

// Это не интерфейс, потому что TS только так дает сделать нужную логику
export type CreateMessageRequest = {
  senderId: SenderId;
  conversationId: ConversationId;
} & MessageTypeWithContent;
