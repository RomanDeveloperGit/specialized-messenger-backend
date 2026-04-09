import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';

import { User } from '@/modules/user/dto/user.dto';
import { UserService } from '@/modules/user/user.service';

import { ERROR_USER_NOT_FOUND } from './auth.constants';
import { SignInRequest } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async signIn(response: Response, data: SignInRequest): Promise<User> {
    const user = await this.userService.getByCredentials(data);

    if (!user) {
      throw new BadRequestException({
        code: ERROR_USER_NOT_FOUND,
      });
    }

    return user;
  }
}
