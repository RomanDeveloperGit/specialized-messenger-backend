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

import { parseAuthorizationHeader } from '@/shared/libs/authorization-header';
import { UserRoleName } from '@/shared/modules/generated/prisma/enums';

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

    const credentials = parseAuthorizationHeader(authHeader);

    if (!credentials) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.getByCredentials(credentials);

    if (!user) {
      throw new ForbiddenException();
    }

    const options = this.reflector.get<AuthGuardOptions>(
      AUTH_GUARD_OPTIONS_KEY,
      context.getHandler(),
    );

    if (options?.checkAdminRole && user.role.name !== UserRoleName.ADMIN) {
      throw new ForbiddenException('Admin role required');
    }

    (request as AuthorizedRequest).user = user;

    return true;
  }
}
