import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiBasicAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { UserService } from '@/modules/user/user.service';

import { UserRole } from '@/shared/modules/generated/prisma/enums';

interface AuthGuardOptions {
  checkAdminRole?: boolean;
}

const AUTH_GUARD_OPTIONS_KEY = 'authGuardOptions';

@Injectable()
class RawAuthGuard implements CanActivate {
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

    const user = await this.userService.getUserByCredentials({ login, password });

    if (!user) {
      throw new UnauthorizedException();
    }

    const options = this.reflector.get<AuthGuardOptions>(
      AUTH_GUARD_OPTIONS_KEY,
      context.getHandler(),
    );

    if (options?.checkAdminRole && user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Admin role required');
    }

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

export function AuthGuard(options: AuthGuardOptions = {}) {
  return applyDecorators(
    SetMetadata(AUTH_GUARD_OPTIONS_KEY, options),
    ApiBasicAuth(),
    UseGuards(RawAuthGuard),
  );
}
