import { BadRequestException, Injectable } from '@nestjs/common';

import { uuidv7 } from 'uuidv7';

import { UserService } from '@/modules/user/user.service';

import { Id, PublicId } from '@/shared/libs/ids';
import { InvitationStatus } from '@/shared/modules/generated/prisma/enums';
import { PrismaService } from '@/shared/modules/prisma';

import { AcceptInvitationByPublicIdRequest } from './dto/accept-invitation-by-public-id.dto';
import { CreateInvitationRequest } from './dto/create-invitation.dto';
import { Invitation } from './dto/invitation.dto';
import { ERROR_INVITATION_NOT_FOUND, ERROR_INVITATION_NOT_PENDING } from './invitation.constants';

@Injectable()
export class InvitationService {
  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
  ) {}

  async create(data: CreateInvitationRequest, authorUserId: Id): Promise<Invitation> {
    const invitation = await this.prismaService.invitation.create({
      data: {
        ...data,
        publicId: uuidv7(),
        authorUserId: BigInt(authorUserId),
      },
    });

    return new Invitation(invitation);
  }

  async getByPublicId(publicId: PublicId): Promise<Invitation> {
    const invitation = await this.prismaService.invitation.findUnique({
      where: {
        publicId,
      },
    });

    if (!invitation) {
      throw new BadRequestException({
        code: ERROR_INVITATION_NOT_FOUND,
      });
    }

    return new Invitation(invitation);
  }

  async acceptByPublicId(
    publicId: PublicId,
    data: AcceptInvitationByPublicIdRequest,
  ): Promise<void> {
    const invitation = await this.getByPublicId(publicId);

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException({
        code: ERROR_INVITATION_NOT_PENDING,
      });
    }

    await this.userService.create({
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      login: data.login,
      password: data.password,
    });

    await this.prismaService.invitation.update({
      where: {
        id: BigInt(invitation.id),
      },
      data: {
        status: InvitationStatus.ACCEPTED,
      },
    });
  }
}
