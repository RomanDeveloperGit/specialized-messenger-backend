import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';

import { AuthGuard } from '@/modules/auth/auth.guard';
import { AuthorizedRequest } from '@/modules/auth/auth.types';

import { ChatService } from './chat.service';
import { CreateConversationRequest } from './dto/create-conversation.dto';
import { GetConversationByIdParams } from './dto/get-conversation-by-id.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @AuthGuard({ checkAdminRole: true }) // TODO: разрешить всем авторизованным
  async createConversation(@Req() req: AuthorizedRequest, @Body() data: CreateConversationRequest) {
    return await this.chatService.createConversation(req.user.id, data);
  }

  @Get('conversations')
  @AuthGuard()
  async getConversations(@Req() req: AuthorizedRequest) {
    return await this.chatService.getConversations(req.user.id);
  }

  @Get('conversations/:id')
  @AuthGuard()
  async getConversationById(
    @Req() req: AuthorizedRequest,
    @Param() { id: conversationId }: GetConversationByIdParams,
  ) {
    return await this.chatService.getConversationById(conversationId, req.user.id);
  }
}
