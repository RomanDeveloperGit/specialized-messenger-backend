import { Server, Socket } from 'socket.io';

import { User } from '@/modules/user/dto/user.dto';

import { WSClientToServerEvents, WSServerToClientEvents } from './chat.constants';
import { Conversation } from './dto/conversation.dto';

export type WSTypedServer = Server<WSClientToServerEvents, WSServerToClientEvents>;

export interface AuthorizedSocket extends Socket<WSClientToServerEvents, WSServerToClientEvents> {
  data: {
    user: User;
  };
}

export interface RoomedSocket extends AuthorizedSocket {
  data: AuthorizedSocket['data'] & {
    currentConversation: Pick<Conversation, 'id' | 'publicId' | 'participants'>;
  };
}
