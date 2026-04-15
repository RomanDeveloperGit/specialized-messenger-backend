import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { UserService } from '@/modules/user/user.service';

import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatListener } from './chat.listener';
import { ChatService } from './chat.service';
import { AuthorizedSocketGuard, RoomedSocketGuard } from './guards/ws.guard';
import { ValidateParticipantUserIdsPipe } from './pipes/validate-participant-user-ids.pipe';

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
    ValidateParticipantUserIdsPipe,
  ],
})
export class ChatModule {}
