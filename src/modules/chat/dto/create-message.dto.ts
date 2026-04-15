import { MessageTypeNameWithContentObject } from '@/modules/chat/chat.constants';

import { Id } from '@/shared/libs/ids';

// Это не интерфейс, потому что TS только так дает сделать нужную логику
export type CreateMessageRequest = {
  authorUserId?: Id;
  conversationId: Id;
} & MessageTypeNameWithContentObject;
