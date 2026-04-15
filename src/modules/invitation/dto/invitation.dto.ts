import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { Id, PublicId } from '@/shared/libs/ids';
import {
  Invitation as _Invitation,
  InvitationStatus,
} from '@/shared/modules/generated/prisma/client';

export class Invitation implements Omit<_Invitation, 'id' | 'authorUserId'> {
  @Expose()
  id: Id;

  @Expose()
  publicId: PublicId;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  authorUserId: Id;

  @Expose()
  @ApiProperty({
    enum: InvitationStatus,
    example: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Expose()
  createdAt: Date;

  constructor(invitation: _Invitation) {
    Object.assign(this, {
      ...invitation,
      id: invitation.id.toString(),
      authorUserId: invitation.authorUserId.toString(),
    });
  }
}
