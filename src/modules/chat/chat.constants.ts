import { UserId } from '@/modules/user/dto/user.dto';

import { MessageType } from '@/shared/modules/generated/prisma/enums';

import {
  FromClientJoinConversationEventBody,
  FromClientSendMessageEventBody,
  FromServerNewMessageEventBody,
} from './dto/ws.dto';

// Количество сообщений в подгрузке всех чатов (незачем тянуть все сообщения сразу. Это сделать нужно при открытии чата)
export const MIN_PRELOADED_MESSAGES_COUNT = 10;

export const ERROR_INVALID_PARTICIPANTS = 'ERROR_INVALID_PARTICIPANTS';
export const ERROR_CONVERSATION_NOT_FOUND = 'ERROR_CONVERSATION_NOT_FOUND';

export const WS_PERSONAL_USER_ROOM_PREFIX = 'user';
export const WS_CONVERSATION_ROOM_PREFIX = 'conversation';

export type MessageTypeContent = {
  [MessageType.SYSTEM_CONVERSATION_CREATED]: Record<string, never>;
  [MessageType.SYSTEM_USER_JOINED]: {
    userId: UserId;
  };
  [MessageType.TEXT]: {
    text: string;
  };
};

export type MessageTypeWithContent = {
  [T in MessageType]: { type: T; content: MessageTypeContent[T] };
}[MessageType];

export const CHAT_EVENT = {
  CONVERSATION_CREATED: 'chat.conversation.created',
} as const;

export interface WSClientToServerEvents {
  'from-client:conversation.join': (data: FromClientJoinConversationEventBody) => void;
  'from-client:conversation.leave': (data: void) => void;
  'from-client:message.new': (data: FromClientSendMessageEventBody) => void;
}

export type WSClientToServerEventsKeys = keyof WSClientToServerEvents;

export interface WSServerToClientEvents {
  'from-server:message.new': (data: FromServerNewMessageEventBody) => void;
  'from-server:conversations.update': (data: void) => void;
  'from-server:error': (data: void) => void; // TODO: коды ошибок отправлять
}
