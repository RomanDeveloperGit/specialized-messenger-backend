import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { uuidv7 } from 'uuidv7';

import { PushSubscriptionService } from '@/modules/push-subscription/push-subscription.service';
import { UserService } from '@/modules/user/user.service';

import { Id, PublicId } from '@/shared/libs/ids';
import { getUserFullName } from '@/shared/libs/user';
import {
  ConversationParticipantRoleName,
  ConversationTypeName,
  MessageTypeName,
} from '@/shared/modules/generated/prisma/client';
import { PrismaService } from '@/shared/modules/prisma';

import {
  CHAT_EVENT,
  ERROR_CONVERSATION_NOT_FOUND,
  ERROR_CONVERSATION_PARTICIPANT_ALREADY_EXISTS,
  ERROR_CONVERSATION_PARTICIPANT_CANNOT_REMOVE_SELF,
  ERROR_CONVERSATION_PARTICIPANT_NOT_FOUND,
  ERROR_CONVERSATION_PARTICIPANT_NOT_OWNER,
  ERROR_INVALID_CONVERSATION_TYPE,
  ERROR_INVALID_PARTICIPANTS,
  MessageContent,
  PRELOAD_MESSAGES_COUNT,
} from './chat.constants';
import { sortParticipants, splitParticipants } from './chat.utils';
import { AddConversationParticipantsRequest } from './dto/add-conversation-participants.dto';
import { Conversation } from './dto/conversation.dto';
import { CreateConversationRequest } from './dto/create-conversation.dto';
import { CreateMessageRequest } from './dto/create-message.dto';
import {
  ConversationCreatedEvent,
  ConversationParticipantAddedEvent,
  ConversationParticipantRemovedEvent,
} from './dto/events.dto';
import { Message } from './dto/message.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
    private readonly pushSubscriptionService: PushSubscriptionService,
  ) {}

  async createConversation(
    ownerId: Id,
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

    if (conversationData.type === ConversationTypeName.DIRECT) {
      const conversation = await this.prismaService.conversation.findFirst({
        where: {
          type: {
            name: ConversationTypeName.DIRECT,
          },
          AND: [
            { participants: { some: { userId: allParticipantUserIds[0], leavedAt: null } } },
            { participants: { some: { userId: allParticipantUserIds[1], leavedAt: null } } },
            { participants: { every: { userId: { in: allParticipantUserIds }, leavedAt: null } } },
          ],
        },
      });

      if (conversation) {
        throw new BadRequestException({
          code: ERROR_INVALID_PARTICIPANTS,
        });
      }
    }

    const [conversationCreatedType, userJoinedType, ownerRole, memberRole] = await Promise.all([
      this.prismaService.messageType.findUniqueOrThrow({
        where: { name: MessageTypeName.SYSTEM_CONVERSATION_CREATED },
        select: { id: true },
      }),
      this.prismaService.messageType.findUniqueOrThrow({
        where: { name: MessageTypeName.SYSTEM_USER_JOINED },
        select: { id: true },
      }),
      this.prismaService.conversationParticipantRole.findUniqueOrThrow({
        where: { name: ConversationParticipantRoleName.OWNER },
        select: { id: true },
      }),
      this.prismaService.conversationParticipantRole.findUniqueOrThrow({
        where: { name: ConversationParticipantRoleName.MEMBER },
        select: { id: true },
      }),
    ]);

    const systemUserJoinedMessages =
      conversationData.type === ConversationTypeName.GROUP
        ? participantUserPublicIds.map((participantUserPublicId) => ({
            publicId: uuidv7(),
            typeId: userJoinedType.id,
            content: JSON.stringify({
              userPublicId: participantUserPublicId,
            } satisfies MessageContent<'SYSTEM_USER_JOINED'>),
          }))
        : [];

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
          createMany: {
            data: allParticipantUserIds.map((participantUserId) => ({
              publicId: uuidv7(),
              userId: participantUserId,
              roleId: participantUserId === BigInt(ownerId) ? ownerRole.id : memberRole.id,
            })),
          },
        },
        messages: {
          createMany: {
            data: [
              {
                publicId: uuidv7(),
                typeId: conversationCreatedType.id,
                content: JSON.stringify('' satisfies MessageContent<'SYSTEM_CONVERSATION_CREATED'>),
              },
              ...systemUserJoinedMessages,
            ],
          },
        },
      },
      include: {
        participants: {
          where: {
            leavedAt: null,
          },
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
            author: {
              include: {
                role: true,
              },
            },
          },
          orderBy: [
            {
              createdAt: 'desc',
            },
            {
              id: 'desc',
            },
          ],
        },
      },
    });

    const conversation = new Conversation({
      ...rawConversation,
      removedParticipants: [],
      messages: [...rawConversation.messages].reverse(),
    });

    const isGroupConversation = conversation.type.name === ConversationTypeName.GROUP;

    this.pushSubscriptionService.sendToUsers(participantUserIds, {
      title: isGroupConversation
        ? `Вас добавили в группу "${conversation.name}"`
        : `${getUserFullName(conversation.participants.at(0)?.user)} создал с вами личный чат`,
    });

    this.eventEmitter.emit(
      CHAT_EVENT.CONVERSATION_CREATED,
      new ConversationCreatedEvent(conversation),
    );

    return conversation;
  }

  async getConversations(initiatorUserId: Id): Promise<Conversation[]> {
    const conversations = await this.prismaService.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: BigInt(initiatorUserId),
            leavedAt: null,
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
            author: {
              include: {
                role: true,
              },
            },
          },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: PRELOAD_MESSAGES_COUNT,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return conversations.map((conversation) => {
      const { activeParticipants, removedParticipants } = splitParticipants(
        conversation.participants,
      );

      return new Conversation({
        ...conversation,
        participants: sortParticipants(activeParticipants),
        removedParticipants,
        messages: [...conversation.messages].reverse(),
      });
    });
  }

  async getConversationByPublicId(
    conversationPublicId: PublicId,
    initiatorUserId: Id,
  ): Promise<Conversation> {
    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        publicId: conversationPublicId,
        participants: {
          some: {
            userId: BigInt(initiatorUserId),
            leavedAt: null,
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
            author: {
              include: {
                role: true,
              },
            },
          },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        },
      },
    });

    if (!conversation) {
      throw new BadRequestException({
        code: ERROR_CONVERSATION_NOT_FOUND,
      });
    }

    const { activeParticipants, removedParticipants } = splitParticipants(
      conversation.participants,
    );

    return new Conversation({
      ...conversation,
      participants: sortParticipants(activeParticipants),
      removedParticipants,
      messages: [...conversation.messages].reverse(),
    });
  }

  async createMessage(data: CreateMessageRequest): Promise<Message> {
    if (data.authorUserId) {
      const participant = await this.prismaService.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: BigInt(data.conversationId),
            userId: BigInt(data.authorUserId),
          },
          leavedAt: null,
        },
        select: { id: true },
      });

      if (!participant) {
        throw new BadRequestException({
          code: ERROR_CONVERSATION_PARTICIPANT_NOT_FOUND,
        });
      }
    }

    const { id: typeId } = await this.prismaService.messageType.findUniqueOrThrow({
      where: {
        name: data.type,
      },
      select: {
        id: true,
      },
    });

    const [rawMessage] = await this.prismaService.$transaction([
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
          conversation: {
            include: {
              participants: true,
              type: true,
            },
          },
          author: {
            include: {
              role: true,
            },
          },
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

    const message = new Message(rawMessage);

    const isGroupConversation = rawMessage.conversation.type.name === ConversationTypeName.GROUP;
    const messageText = (message.content as MessageContent<'TEXT'>)?.text || '';

    this.pushSubscriptionService.sendToUsers(
      rawMessage.conversation.participants
        .map((participant) => String(participant.userId))
        .filter((userId) => userId !== String(data.authorUserId)),
      {
        title: isGroupConversation
          ? rawMessage.conversation.name || ''
          : getUserFullName(rawMessage.author),
        content: isGroupConversation
          ? messageText
          : `${getUserFullName(rawMessage.author)}: ${messageText}`,
      },
    );

    return message;
  }

  async getRelatedParticipantUserIdsByUserId(initiatorUserId: Id): Promise<Id[]> {
    const participants = await this.prismaService.conversationParticipant.findMany({
      where: {
        userId: BigInt(initiatorUserId),
        leavedAt: null,
      },
      select: {
        conversationId: true,
      },
    });

    const conversationIds = participants.map((participant) => participant.conversationId);

    if (!conversationIds.length) return [];

    const relatedParticipants = await this.prismaService.conversationParticipant.findMany({
      where: {
        conversationId: {
          in: conversationIds,
        },
        userId: {
          not: BigInt(initiatorUserId),
        },
        leavedAt: null,
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    return relatedParticipants.map((participant) => participant.userId.toString());
  }

  async addConversationParticipants(
    conversationPublicId: PublicId,
    { userIds: userPublicIds }: AddConversationParticipantsRequest,
    initiatorUserId: Id,
  ): Promise<Conversation> {
    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        publicId: conversationPublicId,
        participants: {
          some: {
            userId: BigInt(initiatorUserId),
            leavedAt: null,
          },
        },
      },
      include: {
        participants: {
          where: {
            leavedAt: null,
          },
        },
        type: true,
      },
    });

    if (!conversation) {
      throw new BadRequestException({ code: ERROR_CONVERSATION_NOT_FOUND });
    }

    if (conversation.type.name !== ConversationTypeName.GROUP) {
      throw new BadRequestException({ code: ERROR_INVALID_CONVERSATION_TYPE });
    }

    const newParticipantUserIds = await this.userService.getIdsByPublicIds(userPublicIds);
    const newParticipantUserIdsSet = new Set(newParticipantUserIds);

    if (newParticipantUserIds.length !== userPublicIds.length) {
      throw new BadRequestException({ code: ERROR_INVALID_PARTICIPANTS });
    }

    const existingParticipant = conversation.participants.find((participant) =>
      newParticipantUserIdsSet.has(participant.userId.toString()),
    );

    if (existingParticipant) {
      throw new BadRequestException({ code: ERROR_CONVERSATION_PARTICIPANT_ALREADY_EXISTS });
    }

    const [memberRole, userJoinedType] = await Promise.all([
      this.prismaService.conversationParticipantRole.findUniqueOrThrow({
        where: { name: ConversationParticipantRoleName.MEMBER },
        select: { id: true },
      }),
      this.prismaService.messageType.findUniqueOrThrow({
        where: { name: MessageTypeName.SYSTEM_USER_JOINED },
        select: { id: true },
      }),
    ]);

    const now = new Date();

    const existingLeft = await this.prismaService.conversationParticipant.findMany({
      where: {
        conversationId: conversation.id,
        userId: { in: newParticipantUserIds.map(BigInt) },
        leavedAt: { not: null },
      },
      select: { userId: true },
    });
    const existingLeftUserIds = new Set(
      existingLeft.map((participant) => participant.userId.toString()),
    );

    const toCreate = newParticipantUserIds.filter((id) => !existingLeftUserIds.has(id));
    const toUpdate = newParticipantUserIds.filter((id) => existingLeftUserIds.has(id));

    await this.prismaService.$transaction([
      ...(toCreate.length
        ? [
            this.prismaService.conversationParticipant.createMany({
              data: toCreate.map((userId) => ({
                publicId: uuidv7(),
                conversationId: conversation.id,
                userId: BigInt(userId),
                roleId: memberRole.id,
              })),
            }),
          ]
        : []),
      ...(toUpdate.length
        ? [
            this.prismaService.conversationParticipant.updateMany({
              where: {
                conversationId: conversation.id,
                userId: { in: toUpdate.map(BigInt) },
              },
              data: {
                roleId: memberRole.id,
                leavedAt: null,
                joinedAt: now,
              },
            }),
          ]
        : []),
      this.prismaService.message.createMany({
        data: userPublicIds.map((userPublicId) => ({
          publicId: uuidv7(),
          conversationId: conversation.id,
          typeId: userJoinedType.id,
          content: JSON.stringify({
            userPublicId,
          } satisfies MessageContent<'SYSTEM_USER_JOINED'>),
        })),
      }),

      this.prismaService.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: now },
      }),
    ]);

    const updatedConversation = await this.getConversationByPublicId(
      conversationPublicId,
      initiatorUserId,
    );

    const participantUserIds = updatedConversation.participants.map((participant) =>
      String(participant.userId),
    );

    this.pushSubscriptionService.sendToUsers(newParticipantUserIds, {
      title: `Вас добавили в группу ${updatedConversation.name}}`,
    });

    this.pushSubscriptionService.sendToUsers(
      participantUserIds.filter((userId) => !newParticipantUserIdsSet.has(userId)),
      {
        title: updatedConversation.name || '',
        content: `В группу добавлены новые участники`,
      },
    );

    this.eventEmitter.emit(
      CHAT_EVENT.CONVERSATION_PARTICIPANT_ADDED,
      new ConversationParticipantAddedEvent(updatedConversation),
    );

    return updatedConversation;
  }

  async removeConversationParticipant(
    conversationPublicId: PublicId,
    participantPublicId: PublicId,
    initiatorUserId: Id,
  ): Promise<Conversation> {
    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        publicId: conversationPublicId,
        AND: [
          {
            participants: {
              some: {
                userId: BigInt(initiatorUserId),
                leavedAt: null,
              },
            },
          },
          {
            participants: {
              some: {
                publicId: participantPublicId,
                leavedAt: null,
              },
            },
          },
        ],
      },
      include: {
        participants: {
          where: {
            leavedAt: null,
          },
          include: {
            role: true,
            user: true,
          },
        },
        type: true,
      },
    });

    if (!conversation) {
      throw new BadRequestException({ code: ERROR_CONVERSATION_NOT_FOUND });
    }

    if (conversation.type.name !== ConversationTypeName.GROUP) {
      throw new BadRequestException({ code: ERROR_INVALID_CONVERSATION_TYPE });
    }

    const initiatorParticipant = conversation.participants.find(
      (participant) => participant.userId === BigInt(initiatorUserId),
    )!;

    if (initiatorParticipant.role.name !== ConversationParticipantRoleName.OWNER) {
      throw new BadRequestException({ code: ERROR_CONVERSATION_PARTICIPANT_NOT_OWNER });
    }

    const targetParticipant = conversation.participants.find(
      (participant) => participant.publicId === participantPublicId,
    )!;

    if (targetParticipant.userId === BigInt(initiatorUserId)) {
      throw new BadRequestException({ code: ERROR_CONVERSATION_PARTICIPANT_CANNOT_REMOVE_SELF });
    }

    const { id: userLeavedTypeId } = await this.prismaService.messageType.findUniqueOrThrow({
      where: { name: MessageTypeName.SYSTEM_USER_LEAVED },
      select: { id: true },
    });

    const [removedParticipant] = await this.prismaService.$transaction([
      this.prismaService.conversationParticipant.update({
        where: { id: targetParticipant.id },
        include: {
          user: true,
        },
        data: { leavedAt: new Date() },
      }),
      this.prismaService.message.create({
        data: {
          publicId: uuidv7(),
          conversationId: conversation.id,
          typeId: userLeavedTypeId,
          content: JSON.stringify({
            userPublicId: targetParticipant.user.publicId,
          } satisfies MessageContent<'SYSTEM_USER_LEAVED'>),
        },
      }),
      this.prismaService.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    const removedParticipantUserId = String(removedParticipant.userId);

    const updatedConversation = await this.getConversationByPublicId(
      conversationPublicId,
      initiatorUserId,
    );

    this.pushSubscriptionService.sendToUser(removedParticipantUserId, {
      title: `Вас удалили из группы ${updatedConversation.name}}`,
    });

    this.pushSubscriptionService.sendToUsers(
      updatedConversation.participants.map((participant) => String(participant.userId)),
      {
        title: updatedConversation.name || '',
        content: `${getUserFullName(removedParticipant.user)} удалён из группы`,
      },
    );

    this.eventEmitter.emit(
      CHAT_EVENT.CONVERSATION_PARTICIPANT_REMOVED,
      new ConversationParticipantRemovedEvent(updatedConversation, removedParticipantUserId),
    );

    return updatedConversation;
  }
}
