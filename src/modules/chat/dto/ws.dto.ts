import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

import { Message } from './message.dto';
import { ConversationId } from './types.dto';

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
  conversationId: ConversationId;
  message: Message;
}
