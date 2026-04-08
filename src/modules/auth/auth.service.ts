import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';

import { UserService } from '@/modules/user/user.service';

import { AuthorizedUser } from './dto/authorized-user.dto';
import { SignInRequest, SignInResponse } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async signIn(response: Response, data: SignInRequest): Promise<SignInResponse> {
    const user = await this.userService.getUserByCredentials(data);

    if (!user) {
      throw new BadRequestException({
        code: 'ERROR_USER_NOT_FOUND',
        message: "User doesn't exist with this auth data",
      });
    }

    return new AuthorizedUser(user);
  }
}
