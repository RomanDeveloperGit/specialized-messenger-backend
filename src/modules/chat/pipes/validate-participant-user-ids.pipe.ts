import { BadRequestException, Inject, Injectable, PipeTransform } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { AuthorizedRequest } from '@/modules/auth/auth.types';

import { ERROR_INVALID_PARTICIPANTS } from '../chat.constants';
import { CreateConversationRequest } from '../dto/create-conversation.dto';

@Injectable()
export class ValidateParticipantUserIdsPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private readonly request: AuthorizedRequest) {}

  transform(value: CreateConversationRequest) {
    if (value.participantUserIds.length !== 1 && value.type === 'DIRECT') {
      throw new BadRequestException({
        code: ERROR_INVALID_PARTICIPANTS,
      });
    }

    if (value.participantUserIds.includes(this.request.user.publicId)) {
      throw new BadRequestException({
        code: ERROR_INVALID_PARTICIPANTS,
      });
    }

    return value;
  }
}
