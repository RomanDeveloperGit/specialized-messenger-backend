import { ApiProperty } from '@nestjs/swagger';

import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { PublicId } from '@/shared/libs/ids';
import { ConversationTypeName } from '@/shared/modules/generated/prisma/enums';

export class CreateConversationRequest {
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    default: ConversationTypeName.DIRECT,
  })
  @IsEnum(ConversationTypeName)
  type: ConversationTypeName;

  @IsArray()
  @IsUUID('7', { each: true })
  participantUserIds: PublicId[];
}
