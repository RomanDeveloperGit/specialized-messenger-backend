import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  Ack,
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
import { AuthorizedSocket, ParticipantUserId, RoomedSocket, WSTypedServer } from './chat.types';
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

  afterInit(server: WSTypedServer) {
    server.use(async (socket, next) => {
      await this.authBeforeConnectionEstablished(socket);

      next();
    });
  }

  async authBeforeConnectionEstablished(client: Socket) {
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

    const userWithUpdatedOnlineStatus = await this.userService.markAsOnline(user.id);
    const relatedParticipantUserIds = await this.chatService.getUserIdsBySharedConversations(
      user.id,
    );

    (client as AuthorizedSocket).data = {
      user: userWithUpdatedOnlineStatus,
      relatedParticipantUserIds,
    };
  }

  async handleConnection(client: AuthorizedSocket) {
    // Присоединяем сокет в персональную комнату пользователя
    client.join(`${WS_PERSONAL_USER_ROOM_PREFIX}:${client.data.user.id}`);

    client.data.relatedParticipantUserIds.forEach((userId) => {
      this.server
        .to(`${WS_PERSONAL_USER_ROOM_PREFIX}:${userId}`)
        .emit('from-server:user.online', { user: client.data.user });
    });
  }

  async handleDisconnect(client: AuthorizedSocket) {
    const user = await this.userService.markAsOffline(client.data.user.id);

    client.data.relatedParticipantUserIds.forEach((userId) => {
      this.server
        .to(`${WS_PERSONAL_USER_ROOM_PREFIX}:${userId}`)
        .emit('from-server:user.offline', { user });
    });
  }

  emitConversationsUpdate(participantUserIds: ParticipantUserId[]) {
    participantUserIds.forEach((userId) => {
      this.server
        .to(`${WS_PERSONAL_USER_ROOM_PREFIX}:${userId}`)
        .emit('from-server:conversations.update');
    });
  }

  @UseGuards(AuthorizedSocketGuard)
  @SubscribeMessage<WSClientToServerEventsKeys>('from-client:conversation.join')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthorizedSocket,
    @MessageBody() { conversationId }: FromClientJoinConversationEventBody,
    @Ack() ack?: () => void,
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
      participantUserIds: conversation.participants.map(({ userId }) => userId),
    };

    client.join(`${WS_CONVERSATION_ROOM_PREFIX}:${conversationId}`);

    ack?.();
  }

  @UseGuards(RoomedSocketGuard)
  @SubscribeMessage<WSClientToServerEventsKeys>('from-client:conversation.leave')
  handleLeaveConversation(@ConnectedSocket() client: RoomedSocket, @Ack() ack?: () => void) {
    client.leave(`${WS_CONVERSATION_ROOM_PREFIX}:${client.data.currentConversation.id}`);

    delete (client as any).data.currentConversation;

    ack?.();
  }

  @UseGuards(RoomedSocketGuard)
  @SubscribeMessage<WSClientToServerEventsKeys>('from-client:message.new')
  async handleSendMessage(
    @ConnectedSocket() client: RoomedSocket,
    @MessageBody() { content }: FromClientSendMessageEventBody,
    @Ack() ack?: () => void,
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

    this.emitConversationsUpdate(client.data.currentConversation.participantUserIds);

    ack?.();
  }
}
