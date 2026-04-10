import { Socket } from 'socket.io';

import { User } from '@/modules/user/dto/user.dto';

declare global {
  interface AuthorizedSocket extends Socket {
    data: {
      user: User;
    };
  }
}
