import { BadRequestException, Injectable } from '@nestjs/common';

import { UserService } from '@/modules/user/user.service';

import { ConversationType, ParticipantRole } from '@/shared/modules/generated/prisma/client';
import { PrismaService } from '@/shared/modules/prisma';

import {
  CONVERSATIONS_PER_PAGE,
  ERROR_CONVERSATION_NOT_FOUND,
  ERROR_INVALID_PARTICIPANTS,
} from './chat.constants';
import { Conversation } from './dto/conversation.dto';
import { CreateConversationRequest } from './dto/create-conversation.dto';

@Injectable()
export class ChatService {
  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
  ) {}

  async createConversation(
    request: AuthorizedRequest,
    { participantIds, ...conversationData }: CreateConversationRequest,
  ): Promise<Conversation> {
    return await this.prismaService.$transaction(async (tx) => {
      const filteredParticipantIds = participantIds.filter((id) => id !== request.user.id);

      if (
        filteredParticipantIds.length === 0 ||
        (filteredParticipantIds.length > 1 && conversationData.type === ConversationType.DIRECT)
      ) {
        throw new BadRequestException({
          code: ERROR_INVALID_PARTICIPANTS,
        });
      }

      const checkedParticipants = await this.prismaService.user.findMany({
        where: {
          id: {
            in: filteredParticipantIds,
          },
        },
      });

      if (checkedParticipants.length !== filteredParticipantIds.length) {
        throw new BadRequestException({
          code: ERROR_INVALID_PARTICIPANTS,
        });
      }

      const allParticipantIds = [request.user.id, ...filteredParticipantIds];

      const conversation = await tx.conversation.create({
        data: {
          ...conversationData,
          name: conversationData.type === ConversationType.DIRECT ? null : conversationData.name,
          participants: {
            create: allParticipantIds.map((userId) => ({
              userId,
              role: userId === request.user.id ? ParticipantRole.OWNER : ParticipantRole.MEMBER,
            })),
          },
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          messages: true,
        },
      });

      return new Conversation(conversation);
    });
  }

  async getConversationsByUserId(req: AuthorizedRequest): Promise<Conversation[]> {
    const conversations = await this.prismaService.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: req.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: CONVERSATIONS_PER_PAGE,
        },
      },
    });

    return conversations.map(
      (conversation) =>
        new Conversation({
          ...conversation,
          messages: conversation.messages.reverse(), // Делаем порядок "asc"
        }),
    );
  }

  async getConversationById(req: AuthorizedRequest, id: string): Promise<Conversation> {
    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        id,
        participants: {
          some: {
            userId: req.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: true,
      },
    });

    if (!conversation) {
      throw new BadRequestException({
        code: ERROR_CONVERSATION_NOT_FOUND,
      });
    }

    return new Conversation(conversation);
  }
}
