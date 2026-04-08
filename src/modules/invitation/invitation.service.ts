import { BadRequestException, Injectable } from '@nestjs/common';

import { UserService } from '@/modules/user/user.service';

import { InvitationStatus } from '@/shared/modules/generated/prisma/enums';
import { PrismaService } from '@/shared/modules/prisma';

import { ApplyInvitationRequest } from './dto/apply-invitation.dto';
import { CreateInvitationRequest } from './dto/create-invitation.dto';
import { ERROR_INVITATION_NOT_FOUND, ERROR_INVITATION_NOT_PENDING } from './invitation.constants';

@Injectable()
export class InvitationService {
  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
  ) {}

  async create(data: CreateInvitationRequest) {
    return await this.prismaService.invitation.create({
      data,
    });
  }

  async getById(id: string) {
    const invitation = await this.prismaService.invitation.findUnique({
      where: {
        id,
      },
    });

    if (!invitation) {
      throw new BadRequestException({
        code: ERROR_INVITATION_NOT_FOUND,
      });
    }

    return invitation;
  }

  async apply(id: string, data: ApplyInvitationRequest) {
    const invitation = await this.prismaService.invitation.findUnique({
      where: {
        id,
      },
    });

    if (!invitation) {
      throw new BadRequestException({
        code: ERROR_INVITATION_NOT_FOUND,
      });
    }

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
        id,
      },
      data: {
        status: InvitationStatus.ACCEPTED,
      },
    });
  }
}
