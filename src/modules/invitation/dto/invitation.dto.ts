import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import {
  Invitation as _Invitation,
  InvitationStatus,
} from '@/shared/modules/generated/prisma/client';

export type InvitationId = _Invitation['id'];

export class Invitation implements _Invitation {
  @Expose()
  id: InvitationId;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  @ApiProperty({
    enum: InvitationStatus,
  })
  status: InvitationStatus;

  @Expose()
  createdAt: Date;

  constructor(invitation: _Invitation) {
    Object.assign(this, invitation);
  }
}
