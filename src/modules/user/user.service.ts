import { Injectable } from '@nestjs/common';

import { compare, hash } from 'bcrypt';

import { ConfigService } from '@/shared/modules/config';
import { PrismaService } from '@/shared/modules/prisma';

import { CreateUserRequest } from './dto/create-user.dto';
import { GetUserByCredentialsRequest } from './dto/get-user-by-credentials.dto';
import { User } from './dto/user.dto';

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

    return new User(user);
  }

  async getByCredentials(data: GetUserByCredentialsRequest): Promise<User | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        login: data.login,
      },
    });

    if (!user) return null;

    const isPasswordCorrect = await compare(data.password, user.password);

    return isPasswordCorrect ? new User(user) : null;
  }

  async getAll(): Promise<User[]> {
    const users = await this.prismaService.user.findMany();

    return users.map((user) => new User(user));
  }
}
