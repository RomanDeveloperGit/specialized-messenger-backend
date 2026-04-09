import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    console.log(client);
  }
}
