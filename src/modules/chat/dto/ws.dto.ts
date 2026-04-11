import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

import { Conversation, ConversationId } from './conversation.dto';
import { Message } from './message.dto';

export class FromClientJoinConversationEventBody {
  @IsUUID()
  conversationId: ConversationId;
}

export class FromClientSendMessageEventBody {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  content: string;
}

export interface FromServerNewMessageEventBody {
  message: Message;
}

export interface FromServerConversationsUpdateEventBody {
  conversations: Conversation[];
}
