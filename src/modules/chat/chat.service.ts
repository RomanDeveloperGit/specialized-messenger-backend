import { BadRequestException, Injectable } from '@nestjs/common';

import { UserId } from '@/modules/user/dto/user.dto';

import { ConversationType, ParticipantRole } from '@/shared/modules/generated/prisma/client';
import { PrismaService } from '@/shared/modules/prisma';

import {
  ERROR_CONVERSATION_NOT_FOUND,
  ERROR_INVALID_PARTICIPANTS,
  MIN_PRELOADED_MESSAGES_COUNT,
} from './chat.constants';
import { Conversation } from './dto/conversation.dto';
import { CreateConversationRequest } from './dto/create-conversation.dto';
import { CreateMessageRequest } from './dto/create-message.dto';
import { Message } from './dto/message.dto';
import { ConversationId } from './dto/types.dto';

@Injectable()
export class ChatService {
  constructor(private prismaService: PrismaService) {}

  async createConversation(
    userId: UserId,
    { participantUserIds, ...conversationData }: CreateConversationRequest,
  ): Promise<Conversation> {
    return await this.prismaService.$transaction(async (tx) => {
      const filteredParticipantUserIds = participantUserIds.filter((id) => id !== userId);

      if (
        filteredParticipantUserIds.length === 0 ||
        (filteredParticipantUserIds.length > 1 && conversationData.type === ConversationType.DIRECT)
      ) {
        throw new BadRequestException({
          code: ERROR_INVALID_PARTICIPANTS,
        });
      }

      const checkedParticipants = await this.prismaService.user.findMany({
        where: {
          id: {
            in: filteredParticipantUserIds,
          },
        },
      });

      if (checkedParticipants.length !== filteredParticipantUserIds.length) {
        throw new BadRequestException({
          code: ERROR_INVALID_PARTICIPANTS,
        });
      }

      const allParticipantUserIds = [userId, ...filteredParticipantUserIds];

      const conversation = await tx.conversation.create({
        data: {
          ...conversationData,
          name: conversationData.type === ConversationType.DIRECT ? null : conversationData.name,
          participants: {
            create: allParticipantUserIds.map((participantUserId) => ({
              userId: participantUserId,
              role: participantUserId === userId ? ParticipantRole.OWNER : ParticipantRole.MEMBER,
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

  async getConversations(userId: UserId): Promise<Conversation[]> {
    const conversations = await this.prismaService.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
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
          take: MIN_PRELOADED_MESSAGES_COUNT,
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

  async getConversationById(conversationId: ConversationId, userId: UserId): Promise<Conversation> {
    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId,
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

  async getUserIdsByConversationId(conversationId: ConversationId): Promise<number[]> {
    const conversationParticipants = await this.prismaService.conversationParticipant.findMany({
      where: {
        conversationId,
      },
      select: {
        userId: true,
      },
    });

    return conversationParticipants.map(({ userId }) => userId);
  }

  async createMessage(data: CreateMessageRequest): Promise<Message> {
    const message = await this.prismaService.message.create({
      data,
    });

    return new Message(message);
  }
}
