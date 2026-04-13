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

import { MessageType } from '@/shared/modules/generated/prisma/enums';

import {
  WS_CONVERSATION_ROOM_PREFIX,
  WS_PERSONAL_USER_ROOM_PREFIX,
  WSClientToServerEventsKeys,
} from './chat.constants';
import { AuthorizedSocketGuard, RoomedSocketGuard } from './chat.guard';
import { ChatService } from './chat.service';
import { AuthorizedSocket, RoomedSocket, WSTypedServer } from './chat.types';
import { ConversationParticipant } from './dto/conversation-participant.dto';
import { FromClientJoinConversationEventBody, FromClientSendMessageEventBody } from './dto/ws.dto';

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
    const { login, password } = client.handshake.auth;

    if (!login || !password) {
      client.disconnect();
      return;
    }

    const user = await this.userService.getByCredentials({
      login,
      password,
    });

    if (!user) {
      client.disconnect();
      return;
    }

    (client as AuthorizedSocket).data.user = user;

    // Присоединяем сокет в персональную комнату пользователя
    client.join(`${WS_PERSONAL_USER_ROOM_PREFIX}:${user.id}`);
  }

  // TODO: update last seen date
  // async handleDisconnect(client: AuthorizedSocket) {}

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
      conversation = await this.chatService.getConversationById(conversationId, userId);
    } catch {
      client.emit('from-server:error'); // TODO: реакция фронта - выкинуть из открытого чата на главную страницу списка чатов

      return;
    }

    for (const room of client.rooms) {
      if (room.startsWith(`${WS_CONVERSATION_ROOM_PREFIX}:`)) {
        client.leave(room);
      }
    }

    (client as RoomedSocket).data.currentConversation = {
      id: conversation.id,
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
    const conversationId = client.data.currentConversation.id;

    const message = await this.chatService.createMessage({
      conversationId,
      senderId: userId,
      type: MessageType.TEXT,
      content: {
        text: content,
      },
    });

    this.server
      .to(`${WS_CONVERSATION_ROOM_PREFIX}:${conversationId}`)
      .emit('from-server:message.new', {
        message,
      });

    this.emitConversationsUpdate(client.data.currentConversation.participants);
  }

  // TODO: при обновлении participants обновлять их в data.currentConversation у каждого client, который является участником чата
}
