// Этот файл околослужебный. Только для разрешения циклических зависимостей

import {
  Conversation as _Conversation,
  ConversationParticipant as _ConversationParticipant,
  Message as _Message,
} from '@/shared/modules/generated/prisma/client';

export type ConversationId = _Conversation['id'];
export type ConversationParticipantId = _ConversationParticipant['id'];
export type MessageId = _Message['id'];
