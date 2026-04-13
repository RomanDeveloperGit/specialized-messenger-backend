import { Request } from 'express';

import { User } from '@/modules/user/dto/user.dto';

export interface AuthorizedRequest extends Request {
  user: User;
}
