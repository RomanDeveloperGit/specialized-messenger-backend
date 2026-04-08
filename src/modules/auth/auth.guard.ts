import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBasicAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { UserService } from '@/modules/user/user.service';

@Injectable()
class RawAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const { login, password } = this.parseCredentials(authHeader.toString());

    const user = await this.userService.getUserByCredentials({ login, password });

    return !!user;
  }

  private parseCredentials(rawHeader: string): {
    login: string;
    password: string;
  } {
    const header = Buffer.from(rawHeader.substring(6), 'base64').toString('utf-8');
    const [login, password] = header.split(':');

    if (!login || !password) {
      throw new UnauthorizedException();
    }

    return {
      login,
      password,
    };
  }
}

export function AuthGuard() {
  return applyDecorators(ApiBasicAuth(), UseGuards(RawAuthGuard));
}
