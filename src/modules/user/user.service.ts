import { Injectable } from '@nestjs/common';

import { compare, hash } from 'bcrypt';

import { ConfigService } from '@/shared/modules/config';
import { User } from '@/shared/modules/generated/prisma/client';
import { PrismaService } from '@/shared/modules/prisma';

import { CreateUserRequest } from './dto/create-user.dto';
import { GetUserByCredentialsRequest } from './dto/get-user-by-credentials.dto';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(data: CreateUserRequest): Promise<User> {
    const password = await hash(data.password, this.configService.get('passwordHashSalt'));
    const user = await this.prismaService.user.create({
      data: {
        ...data,
        password,
      },
    });

    return user;
  }

  async getUserByCredentials(data: GetUserByCredentialsRequest): Promise<User | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        login: data.login,
      },
    });

    if (!user) return null;

    const isPasswordCorrect = await compare(data.password, user.password);

    return isPasswordCorrect ? user : null;
  }
}
