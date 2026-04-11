import { ApiProperty } from '@nestjs/swagger';

import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';

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
  @IsNumber({}, { each: true })
  participantUserIds: number[];
}
