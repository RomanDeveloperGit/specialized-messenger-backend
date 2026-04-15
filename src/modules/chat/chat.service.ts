import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { uuidv7 } from 'uuidv7';

import { UserService } from '@/modules/user/user.service';

import { Id, PublicId } from '@/shared/libs/ids';
import {
  ConversationParticipantRoleName,
  ConversationTypeName,
  MessageTypeName,
} from '@/shared/modules/generated/prisma/client';
import { PrismaService } from '@/shared/modules/prisma';

import {
  CHAT_EVENT,
  ERROR_CONVERSATION_NOT_FOUND,
  ERROR_INVALID_PARTICIPANTS,
  MessageContent,
  MIN_PRELOADED_MESSAGES_COUNT,
} from './chat.constants';
import { Conversation } from './dto/conversation.dto';
import { CreateConversationRequest } from './dto/create-conversation.dto';
import { CreateMessageRequest } from './dto/create-message.dto';
import { ConversationCreatedEvent } from './dto/events.dto';
import { Message } from './dto/message.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
  ) {}

  async createConversation(
    ownerId: PublicId,
    {
      participantUserIds: participantUserPublicIds,
      ...conversationData
    }: CreateConversationRequest,
  ): Promise<Conversation> {
    const participantUserIds = await this.userService.getIdsByPublicIds(participantUserPublicIds);

    if (participantUserIds.length !== participantUserPublicIds.length) {
      throw new BadRequestException({
        code: ERROR_INVALID_PARTICIPANTS,
      });
    }

    const allParticipantUserIds: bigint[] = [BigInt(ownerId), ...participantUserIds.map(BigInt)];

    const rawConversation = await this.prismaService.conversation.create({
      data: {
        ...conversationData,
        publicId: uuidv7(),
        name: conversationData.type === ConversationTypeName.DIRECT ? null : conversationData.name,
        type: {
          connect: {
            name: conversationData.type,
          },
        },
        participants: {
          create: allParticipantUserIds.map((participantUserId) => ({
            user: {
              connect: {
                id: participantUserId,
              },
            },
            role: {
              connect: {
                name:
                  participantUserId === BigInt(ownerId)
                    ? ConversationParticipantRoleName.OWNER
                    : ConversationParticipantRoleName.MEMBER,
              },
            },
          })),
        },
        messages: {
          create: [
            {
              publicId: uuidv7(),
              type: {
                connect: {
                  name: MessageTypeName.SYSTEM_CONVERSATION_CREATED,
                },
              },
              content: JSON.stringify('' satisfies MessageContent<'SYSTEM_CONVERSATION_CREATED'>),
            },
            ...participantUserPublicIds.map((participantUserPublicId) => ({
              publicId: uuidv7(),
              type: {
                connect: {
                  name: MessageTypeName.SYSTEM_USER_JOINED,
                },
              },
              content: JSON.stringify({
                userPublicId: participantUserPublicId,
              } satisfies MessageContent<'SYSTEM_USER_JOINED'>),
            })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                role: true,
              },
            },
            role: true,
          },
        },
        type: true,
        messages: {
          include: {
            type: true,
          },
        },
      },
    });

    const conversation = new Conversation(rawConversation);

    this.eventEmitter.emit(
      CHAT_EVENT.CONVERSATION_CREATED,
      new ConversationCreatedEvent(conversation),
    );

    return conversation;
  }

  async getConversations(userId: Id): Promise<Conversation[]> {
    const conversations = await this.prismaService.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: BigInt(userId),
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                role: true,
              },
            },
            role: true,
          },
        },
        type: true,
        messages: {
          include: {
            type: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: MIN_PRELOADED_MESSAGES_COUNT,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return conversations.map(
      (conversation) =>
        new Conversation({
          ...conversation,
          messages: [...conversation.messages].reverse(),
        }),
    );
  }

  async getConversationByPublicId(
    conversationPublicId: PublicId,
    userId: Id,
  ): Promise<Conversation> {
    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        publicId: conversationPublicId,
        participants: {
          some: {
            userId: BigInt(userId),
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                role: true,
              },
            },
            role: true,
          },
        },
        type: true,
        messages: {
          include: {
            type: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: MIN_PRELOADED_MESSAGES_COUNT,
        },
      },
    });

    if (!conversation) {
      throw new BadRequestException({
        code: ERROR_CONVERSATION_NOT_FOUND,
      });
    }

    return new Conversation(conversation);
  }

  async createMessage(data: CreateMessageRequest): Promise<Message> {
    const { id: typeId } = await this.prismaService.messageType.findUniqueOrThrow({
      where: {
        name: data.type,
      },
      select: {
        id: true,
      },
    });

    const [message] = await this.prismaService.$transaction([
      this.prismaService.message.create({
        data: {
          publicId: uuidv7(),
          conversationId: BigInt(data.conversationId),
          authorUserId: data.authorUserId ? BigInt(data.authorUserId) : null,
          typeId,
          content: JSON.stringify(data.content),
        },
        include: {
          type: true,
        },
      }),
      this.prismaService.conversation.update({
        where: {
          id: BigInt(data.conversationId),
        },
        data: {
          updatedAt: new Date(),
        },
      }),
    ]);

    return new Message(message);
  }
}
