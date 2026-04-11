import { Server, Socket } from 'socket.io';

import { User } from '@/modules/user/dto/user.dto';

import { WSClientToServerEvents, WSServerToClientEvents } from './chat.constants';
import { Conversation } from './dto/conversation.dto';

declare global {
  type WSTypedServer = Server<WSClientToServerEvents, WSServerToClientEvents>;

  interface AuthorizedSocket extends Socket<WSClientToServerEvents, WSServerToClientEvents> {
    data: {
      user: User;
    };
  }

  interface RoomedSocket extends AuthorizedSocket {
    data: AuthorizedSocket['data'] & {
      currentConversation: Pick<Conversation, 'id' | 'participants'>;
    };
  }
}
