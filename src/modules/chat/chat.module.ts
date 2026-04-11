import { Module } from '@nestjs/common';

import { UserService } from '@/modules/user/user.service';

import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { AuthorizedSocketGuard, RoomedSocketGuard } from './chat.guard';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, UserService, AuthorizedSocketGuard, RoomedSocketGuard],
})
export class ChatModule {}
