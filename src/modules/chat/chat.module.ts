import { Module } from '@nestjs/common';

import { UserService } from '@/modules/user/user.service';

import { ChatGateway } from './chat.gateway';

@Module({
  providers: [ChatGateway, UserService],
})
export class ChatModule {}
