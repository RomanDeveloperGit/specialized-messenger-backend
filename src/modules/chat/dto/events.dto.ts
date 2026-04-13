import { Conversation } from './conversation.dto';

export class ConversationCreatedEvent {
  constructor(public readonly conversation: Conversation) {}
}
