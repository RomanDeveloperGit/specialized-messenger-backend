import { BadRequestException, Injectable } from '@nestjs/common';

import { uuidv7 } from 'uuidv7';

import { UserService } from '@/modules/user/user.service';

import { Id, PublicId } from '@/shared/libs/ids';
import { InvitationStatusName } from '@/shared/modules/generated/prisma/enums';
import { PrismaService } from '@/shared/modules/prisma';

import {
  AcceptInvitationByPublicIdQuery,
  AcceptInvitationByPublicIdRequest,
} from './dto/accept-invitation-by-public-id.dto';
import { CreateInvitationRequest } from './dto/create-invitation.dto';
import { GetInvitationByPublicIdQuery } from './dto/get-invitation-by-public-id.dto';
import { Invitation } from './dto/invitation.dto';
import { ERROR_INVITATION_NOT_FOUND, ERROR_INVITATION_NOT_PENDING } from './invitation.constants';

@Injectable()
export class InvitationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(data: CreateInvitationRequest, authorUserId: Id): Promise<Invitation> {
    const invitation = await this.prismaService.invitation.create({
      data: {
        ...data,
        publicId: uuidv7(),
        status: {
          connect: {
            name: InvitationStatusName.PENDING,
          },
        },
        author: {
          connect: {
            id: BigInt(authorUserId),
          },
        },
      },
      include: {
        status: true,
      },
    });

    return new Invitation(invitation);
  }

  async getByPublicId(
    publicId: PublicId,
    query: GetInvitationByPublicIdQuery,
  ): Promise<Invitation> {
    const invitation = await this.prismaService.invitation.findUnique({
      where: {
        publicId,
        firstName: query.firstName,
        lastName: query.lastName,
      },
      include: {
        status: true,
      },
    });

    if (!invitation) {
      throw new BadRequestException({
        code: ERROR_INVITATION_NOT_FOUND,
      });
    }

    if (invitation.status.name !== InvitationStatusName.PENDING) {
      throw new BadRequestException({
        code: ERROR_INVITATION_NOT_PENDING,
      });
    }

    return new Invitation(invitation);
  }

  async acceptByPublicId(
    publicId: PublicId,
    data: AcceptInvitationByPublicIdRequest,
    query: AcceptInvitationByPublicIdQuery,
  ): Promise<void> {
    const invitation = await this.getByPublicId(publicId, query);

    await this.userService.create({
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      login: data.login,
      password: data.password,
    });

    await this.prismaService.invitation.update({
      where: {
        id: BigInt(invitation.id),
        firstName: invitation.firstName,
        lastName: invitation.lastName,
      },
      data: {
        status: {
          connect: {
            name: InvitationStatusName.ACCEPTED,
          },
        },
      },
    });
  }
}
