import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { UserService } from '@/modules/user/user.service';

import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { AuthorizedSocketGuard, RoomedSocketGuard } from './chat.guard';
import { ChatListener } from './chat.listener';
import { ChatService } from './chat.service';

// TODO: разбить модуль на несколько разных доменов (+ мб переименовать conversation -> chat)
@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatListener,
    ChatService,
    UserService,
    AuthorizedSocketGuard,
    RoomedSocketGuard,
  ],
})
export class ChatModule {}
