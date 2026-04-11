import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { Socket } from 'socket.io';

const isAuthorizedSocket = (socket: Socket): socket is AuthorizedSocket => {
  return !!socket.data.user;
};

@Injectable()
export class AuthorizedSocketGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    if (!isAuthorizedSocket(client)) {
      client.disconnect();

      throw new WsException('Socket is not authorized');
    }

    return true;
  }
}

const isRoomedSocket = (socket: Socket): socket is RoomedSocket => {
  return !!socket.data.currentConversation;
};

@Injectable()
export class RoomedSocketGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    if (!isRoomedSocket(client)) {
      throw new WsException('Socket is not roomed');
    }

    return true;
  }
}
