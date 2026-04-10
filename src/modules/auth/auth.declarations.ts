import { Request } from 'express';

import { User } from '@/modules/user/dto/user.dto';

declare global {
  interface AuthorizedRequest extends Request {
    user: User;
  }
}
