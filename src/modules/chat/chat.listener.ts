import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CHAT_EVENT } from './chat.constants';
import { ChatGateway } from './chat.gateway';
import {
  ConversationCreatedEvent,
  ConversationParticipantAddedEvent,
  ConversationParticipantRemovedEvent,
} from './dto/events.dto';

@Injectable()
export class ChatListener {
  constructor(private readonly chatGateway: ChatGateway) {}

  @OnEvent(CHAT_EVENT.CONVERSATION_CREATED)
  handleConversationCreated(event: ConversationCreatedEvent) {
    this.chatGateway.emitConversationsUpdate(
      event.conversation.participants.map(({ userId }) => userId),
    );
  }

  @OnEvent(CHAT_EVENT.CONVERSATION_PARTICIPANT_ADDED)
  handleConversationParticipantAdded(event: ConversationParticipantAddedEvent) {
    this.chatGateway.handleParticipantAdded(event);
  }

  @OnEvent(CHAT_EVENT.CONVERSATION_PARTICIPANT_REMOVED)
  handleConversationParticipantRemoved(event: ConversationParticipantRemovedEvent) {
    this.chatGateway.handleParticipantRemoved(event);
  }
}
