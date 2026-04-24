import { NestFactory } from '@nestjs/core';

import { ChatService } from '@/modules/chat/chat.service';
import { InvitationService } from '@/modules/invitation/invitation.service';
import { User } from '@/modules/user/dto/user.dto';
import { UserService } from '@/modules/user/user.service';

import { PrismaService } from '@/shared/modules/prisma';

import { AppModule } from '@/app.module';

import { INVITATION_MOCKS } from './mocks/invitations';
import { USER_MOCKS } from './mocks/users';
import { prepareStep } from './prepare-step';

export const executeSeed = async () => {
  prepareStep();

  const app = await NestFactory.createApplicationContext(AppModule);
  const prismaService = app.get(PrismaService);
  const userService = app.get(UserService);
  const chatService = app.get(ChatService);
  const invitationService = app.get(InvitationService);

  const users: User[] = [];

  for (const user of USER_MOCKS) {
    users.push(await userService.create(user));
  }

  await prismaService.user.update({
    where: {
      id: BigInt(users[0].id),
    },
    data: {
      role: {
        connect: {
          name: 'ADMIN',
        },
      },
    },
  });

  for (const invitation of INVITATION_MOCKS) {
    await invitationService.create(invitation, users[0].id);
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

  console.dir(await prismaService.user.findMany(), { depth: null });
  console.dir(await prismaService.invitation.findMany(), { depth: null });
  console.dir(await prismaService.conversation.findMany(), { depth: null });
  console.dir(await prismaService.message.findMany(), { depth: null });

  console.log('Seeding complete!');

  await prismaService.$disconnect();
  await app.close();
};
