import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { Id } from '@/shared/libs/ids';
import {
  InvitationStatus as _InvitationStatus,
  InvitationStatusName,
} from '@/shared/modules/generated/prisma/client';

export class InvitationStatus implements Omit<_InvitationStatus, 'id'> {
  @Expose()
  id: Id;

  @Expose()
  @ApiProperty({
    enum: InvitationStatusName,
  })
  name: InvitationStatusName;

  @Expose()
  createdAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(invitationStatus: _InvitationStatus) {
    Object.assign(this, {
      ...invitationStatus,
      id: invitationStatus.id.toString(),
    });
  }
}
