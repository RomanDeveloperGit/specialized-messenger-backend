import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

import { PublicId } from '@/shared/libs/ids';

import { Message } from './message.dto';

export class FromClientJoinConversationEventBody {
  @IsUUID()
  conversationId: PublicId;
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
