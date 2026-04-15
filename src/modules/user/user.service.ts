import { Injectable } from '@nestjs/common';

import { compare, hash } from 'bcrypt';
import { uuidv7 } from 'uuidv7';

import { Id, PublicId } from '@/shared/libs/ids';
import { ConfigService } from '@/shared/modules/config';
import { UserRoleName } from '@/shared/modules/generated/prisma/enums';
import { PrismaService } from '@/shared/modules/prisma';

import { CreateUserRequest } from './dto/create-user.dto';
import { GetUserByCredentialsRequest } from './dto/get-user-by-credentials.dto';
import { User } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(data: CreateUserRequest): Promise<User> {
    const password = await hash(data.password, this.configService.get('passwordHashSalt'));
    const user = await this.prismaService.user.create({
      data: {
        ...data,
        publicId: uuidv7(),
        password,
        role: {
          connect: {
            name: UserRoleName.USER,
          },
        },
      },
      include: {
        role: true,
      },
    });

    return new User(user);
  }

  async getByCredentials(data: GetUserByCredentialsRequest): Promise<User | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        login: data.login,
      },
      include: {
        role: true,
      },
    });

    if (!user) return null;

    const isPasswordCorrect = await compare(data.password, user.password);

    return isPasswordCorrect ? new User(user) : null;
  }

  async getAll(): Promise<User[]> {
    const users = await this.prismaService.user.findMany({
      include: {
        role: true,
      },
    });

    return users.map((user) => new User(user));
  }

  async getIdsByPublicIds(publicIds: PublicId[]): Promise<Id[]> {
    const users = await this.prismaService.user.findMany({
      where: {
        publicId: {
          in: publicIds,
        },
      },
      select: {
        id: true,
      },
    });

    return users.map(({ id }) => id.toString());
  }
}
