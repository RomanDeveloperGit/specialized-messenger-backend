import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { UserService } from '@/modules/user/user.service';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly userService: UserService) {}

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

    console.log('connect', client.data);
  }

  async handleDisconnect(client: AuthorizedSocket) {
    // TODO: update last seen date
    console.log('disconnect', client.data);
  }
}
