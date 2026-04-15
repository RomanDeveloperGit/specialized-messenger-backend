import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBasicAuth } from '@nestjs/swagger';

import { AuthGuard, AuthOptions } from '@/modules/auth/auth.guard';
import { AuthorizedRequest } from '@/modules/auth/auth.types';

import { ChatService } from './chat.service';
import { CreateConversationRequest } from './dto/create-conversation.dto';
import { GetConversationByPublicIdParams } from './dto/get-conversation-by-public-id.dto';
import { ValidateParticipantUserIdsPipe } from './pipes/validate-participant-user-ids.pipe';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @AuthOptions({ checkAdminRole: true })
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  async createConversation(
    @Req() req: AuthorizedRequest,
    @Body(ValidateParticipantUserIdsPipe) data: CreateConversationRequest,
  ) {
    return await this.chatService.createConversation(req.user.id, data);
  }

  @Get('conversations')
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  async getConversations(@Req() req: AuthorizedRequest) {
    return await this.chatService.getConversations(req.user.id);
  }

  @Get('conversations/:id')
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  async getConversationByPublicId(
    @Req() req: AuthorizedRequest,
    @Param() { id: conversationPublicId }: GetConversationByPublicIdParams,
  ) {
    return await this.chatService.getConversationByPublicId(conversationPublicId, req.user.id);
  }
}
