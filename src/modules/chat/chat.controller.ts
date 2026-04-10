import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';

import { AuthGuard } from '@/modules/auth/auth.guard';

import { ChatService } from './chat.service';
import { CreateConversationRequest } from './dto/create-conversation.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @AuthGuard({ checkAdminRole: true }) // TODO: разрешить всем авторизованным
  async createConversation(@Req() req: AuthorizedRequest, @Body() data: CreateConversationRequest) {
    return await this.chatService.createConversation(req, data);
  }

  @Get('conversations')
  @AuthGuard()
  async getConversationsByUserId(@Req() req: AuthorizedRequest) {
    return await this.chatService.getConversationsByUserId(req);
  }

  @Get('conversations/:id')
  @AuthGuard()
  async getConversationById(@Req() req: AuthorizedRequest, @Param('id') id: string) {
    return await this.chatService.getConversationById(req, id);
  }
}
