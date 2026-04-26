import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';

import { UserService } from '@/modules/user/user.service';

import { parseAuthorizationHeader } from '@/shared/libs/authorization-header';
import { MessageTypeName } from '@/shared/modules/generated/prisma/enums';

import {
  WS_CONVERSATION_ROOM_PREFIX,
  WS_PERSONAL_USER_ROOM_PREFIX,
  WSClientToServerEventsKeys,
} from './chat.constants';
import { ChatService } from './chat.service';
import { AuthorizedSocket, RoomedSocket, WSTypedServer } from './chat.types';
import { ConversationParticipant } from './dto/conversation-participant.dto';
import { FromClientJoinConversationEventBody, FromClientSendMessageEventBody } from './dto/ws.dto';
import { AuthorizedSocketGuard, RoomedSocketGuard } from './guards/ws.guard';

@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: WSTypedServer;

  constructor(
    private readonly userService: UserService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    const authHeader = client.handshake.headers.authorization;

    if (!authHeader) {
      client.disconnect();
      return;
    }

    const credentials = parseAuthorizationHeader(authHeader);

    if (!credentials) {
      client.disconnect();
      return;
    }

    const user = await this.userService.getByCredentials(credentials);

    if (!user) {
      client.disconnect();
      return;
    }

    (client as AuthorizedSocket).data.user = user;

    // Присоединяем сокет в персональную комнату пользователя
    client.join(`${WS_PERSONAL_USER_ROOM_PREFIX}:${user.id}`);
  }

  emitConversationsUpdate(participants: ConversationParticipant[]) {
    participants.forEach((participant) => {
      this.server
        .to(`${WS_PERSONAL_USER_ROOM_PREFIX}:${participant.userId}`)
        .emit('from-server:conversations.update');
    });
  }

  @UseGuards(AuthorizedSocketGuard)
  @SubscribeMessage<WSClientToServerEventsKeys>('from-client:conversation.join')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthorizedSocket,
    @MessageBody() { conversationId }: FromClientJoinConversationEventBody,
  ) {
    const userId = client.data.user.id;

    let conversation;

    try {
      conversation = await this.chatService.getConversationByPublicId(conversationId, userId);
    } catch {
      client.emit('from-server:error');

      return;
    }

    for (const room of client.rooms) {
      if (room.startsWith(`${WS_CONVERSATION_ROOM_PREFIX}:`)) {
        client.leave(room);
      }
    }

    (client as RoomedSocket).data.currentConversation = {
      id: conversation.id,
      publicId: conversation.publicId,
      participants: conversation.participants,
    };

    client.join(`${WS_CONVERSATION_ROOM_PREFIX}:${conversationId}`);
  }

  @UseGuards(RoomedSocketGuard)
  @SubscribeMessage<WSClientToServerEventsKeys>('from-client:conversation.leave')
  handleLeaveConversation(@ConnectedSocket() client: RoomedSocket) {
    client.leave(`${WS_CONVERSATION_ROOM_PREFIX}:${client.data.currentConversation.id}`);

    delete (client as any).data.currentConversation;
  }

  @UseGuards(RoomedSocketGuard)
  @SubscribeMessage<WSClientToServerEventsKeys>('from-client:message.new')
  async handleSendMessage(
    @ConnectedSocket() client: RoomedSocket,
    @MessageBody() { content }: FromClientSendMessageEventBody,
  ) {
    const userId = client.data.user.id;
    const conversation = client.data.currentConversation;

    const message = await this.chatService.createMessage({
      conversationId: conversation.id,
      authorUserId: userId,
      type: MessageTypeName.TEXT,
      content: {
        text: content,
      },
    });

    this.server
      .to(`${WS_CONVERSATION_ROOM_PREFIX}:${conversation.publicId}`)
      .emit('from-server:message.new', {
        message,
      });

    this.emitConversationsUpdate(client.data.currentConversation.participants);
  }
}
