import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { UserService } from '@/modules/user/user.service';

import { UserRole } from '@/shared/modules/generated/prisma/enums';

import { AuthorizedRequest } from './auth.types';

interface AuthGuardOptions {
  checkAdminRole?: boolean;
}

const AUTH_GUARD_OPTIONS_KEY = 'authGuardOptions';

export const AuthOptions = (options: AuthGuardOptions) =>
  SetMetadata(AUTH_GUARD_OPTIONS_KEY, options);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const { login, password } = this.parseCredentials(authHeader);

    const user = await this.userService.getByCredentials({ login, password });

    if (!user) {
      throw new ForbiddenException();
    }

    const options = this.reflector.get<AuthGuardOptions>(
      AUTH_GUARD_OPTIONS_KEY,
      context.getHandler(),
    );

    if (options?.checkAdminRole && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin role required');
    }

    (request as AuthorizedRequest).user = user;

    return true;
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
