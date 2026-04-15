import { NestFactory } from '@nestjs/core';

import { UserService } from '@/modules/user/user.service';

import { PrismaService } from '@/shared/modules/prisma';

import { AppModule } from '@/app.module';

import { USER_MOCKS } from './mocks/users';

export const executeSeed = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prismaService = app.get(PrismaService);

  await prismaService.$transaction([
    prismaService.invitation.deleteMany(),
    prismaService.message.deleteMany(),
    prismaService.conversationParticipant.deleteMany(),
    prismaService.conversation.deleteMany(),
    prismaService.user.deleteMany(),
  ]);

  const userService = app.get(UserService);

  for (const user of USER_MOCKS) {
    await userService.create(user);
  }

  console.log('Seeding complete!');

  await prismaService.$disconnect();
  await app.close();
};
