import { execSync } from 'node:child_process';

import { NestFactory } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ChatService } from '@/modules/chat/chat.service';
import { User } from '@/modules/user/dto/user.dto';
import { UserService } from '@/modules/user/user.service';

import { PrismaService } from '@/shared/modules/prisma';

import { AppModule } from '@/app.module';

import { USER_MOCKS } from './mocks/users';

export const executeSeed = async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  EventEmitter2.prototype.emit = () => {};

  const app = await NestFactory.createApplicationContext(AppModule);
  const prismaService = app.get(PrismaService);
  const userService = app.get(UserService);
  const chatService = app.get(ChatService);

  execSync('npx prisma migrate reset --force', { stdio: 'inherit' });

  const users: User[] = [];

  for (const user of USER_MOCKS) {
    users.push(await userService.create(user));
  }

  const conversation = await chatService.createConversation(users[0].id, {
    type: 'DIRECT',
    participantUserIds: [users[1].publicId],
  });

  await chatService.createMessage({
    conversationId: conversation.id,
    authorUserId: users[0].id,
    type: 'TEXT',
    content: {
      text: 'Передаю привет от админа!',
    },
  });

  await chatService.createMessage({
    conversationId: conversation.id,
    authorUserId: users[1].id,
    type: 'TEXT',
    content: {
      text: 'Принимаю привет от админа!',
    },
  });

  console.log('Seeding complete!');

  await prismaService.$disconnect();
  await app.close();
};
