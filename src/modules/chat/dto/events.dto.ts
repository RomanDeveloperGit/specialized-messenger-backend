import { Id } from '@/shared/libs/ids';

import { Conversation } from './conversation.dto';

export class ConversationCreatedEvent {
  constructor(public readonly conversation: Conversation) {}
}

export class ConversationParticipantAddedEvent {
  constructor(public readonly conversation: Conversation) {}
}

export class ConversationParticipantRemovedEvent {
  constructor(
    public readonly conversation: Conversation,
    public readonly removedParticipantUserId: Id,
  ) {}
}
