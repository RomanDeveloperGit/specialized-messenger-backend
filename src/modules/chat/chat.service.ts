import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { UserId } from '@/modules/user/dto/user.dto';

import {
  ConversationType,
  MessageType,
  ParticipantRole,
} from '@/shared/modules/generated/prisma/client';
import { PrismaService } from '@/shared/modules/prisma';

import {
  CHAT_EVENT,
  ERROR_CONVERSATION_NOT_FOUND,
  ERROR_INVALID_PARTICIPANTS,
  MessageTypeWithContent,
  MIN_PRELOADED_MESSAGES_COUNT,
} from './chat.constants';
import { Conversation } from './dto/conversation.dto';
import { CreateConversationRequest } from './dto/create-conversation.dto';
import { CreateMessageRequest } from './dto/create-message.dto';
import { ConversationCreatedEvent } from './dto/events.dto';
import { Message } from './dto/message.dto';
import { ConversationId } from './dto/types.dto';

@Injectable()
export class ChatService {
  constructor(
    private prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createConversation(
    userId: UserId,
    { participantUserIds, ...conversationData }: CreateConversationRequest,
  ): Promise<Conversation> {
    return await this.prismaService.$transaction(async (tx) => {
      // TODO: перенести это потом в create-conversation.validator.ts + ошибку, если там айдишник самого создателя есть
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

      const rawConversation = await tx.conversation.create({
        data: {
          ...conversationData,
          name: conversationData.type === ConversationType.DIRECT ? null : conversationData.name,
          participants: {
            create: allParticipantUserIds.map((participantUserId) => ({
              userId: participantUserId,
              role: participantUserId === userId ? ParticipantRole.OWNER : ParticipantRole.MEMBER,
            })),
          },
          messages: {
            createMany: {
              data: [
                {
                  type: MessageType.SYSTEM_CONVERSATION_CREATED,
                  content: {},
                } as MessageTypeWithContent,
                ...filteredParticipantUserIds.map<MessageTypeWithContent>((participantUserId) => ({
                  type: MessageType.SYSTEM_USER_JOINED,
                  content: {
                    userId: participantUserId,
                  },
                })),
              ],
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

      const conversation = new Conversation(rawConversation);

      this.eventEmitter.emit(
        CHAT_EVENT.CONVERSATION_CREATED,
        new ConversationCreatedEvent(conversation),
      );

      return conversation;
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
            createdAt: 'asc',
          },
          take: -MIN_PRELOADED_MESSAGES_COUNT,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return conversations.map((conversation) => new Conversation(conversation));
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
    const [message] = await this.prismaService.$transaction([
      this.prismaService.message.create({
        data,
      }),
      this.prismaService.conversation.update({
        where: {
          id: data.conversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      }),
    ]);

    return new Message(message);
  }
}
