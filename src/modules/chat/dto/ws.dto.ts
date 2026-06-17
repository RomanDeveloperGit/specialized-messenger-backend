import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

import { User } from '@/modules/user/dto/user.dto';

import { PublicId } from '@/shared/libs/ids';

import { Message } from './message.dto';

export class FromClientJoinConversationEventBody {
  @IsUUID('7')
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

export interface FromServerConversationsRemoveEventBody {
  conversationId: PublicId;
}

export interface FromServerUserOnlineEventBody {
  user: User;
}

export interface FromServerUserOfflineEventBody {
  user: User;
}
