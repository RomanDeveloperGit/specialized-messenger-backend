import { ApiProperty } from '@nestjs/swagger';

import { IsArray, IsEnum, IsString, IsUUID } from 'class-validator';

import { PublicId } from '@/shared/libs/ids';
import { ConversationType } from '@/shared/modules/generated/prisma/enums';

export class CreateConversationRequest {
  @IsString()
  name?: string;

  @ApiProperty({
    default: ConversationType.DIRECT,
  })
  @IsEnum(ConversationType)
  type: ConversationType;

  @IsArray()
  @IsUUID('7', { each: true })
  participantUserIds: PublicId[];
}
