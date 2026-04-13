import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CHAT_EVENT } from './chat.constants';
import { ChatGateway } from './chat.gateway';
import { ConversationCreatedEvent } from './dto/events.dto';

@Injectable()
export class ChatListener {
  constructor(private readonly chatGateway: ChatGateway) {}

  @OnEvent(CHAT_EVENT.CONVERSATION_CREATED)
  handleConversationCreated(event: ConversationCreatedEvent) {
    this.chatGateway.emitConversationsUpdate(event.conversation.participants);
  }
}
