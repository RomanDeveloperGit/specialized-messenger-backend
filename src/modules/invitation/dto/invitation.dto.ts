import { Expose } from 'class-transformer';

import {
  Invitation as _Invitation,
  InvitationStatus,
} from '@/shared/modules/generated/prisma/client';

export class Invitation implements _Invitation {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  status: InvitationStatus;

  @Expose()
  createdAt: Date;

  constructor(invitation: _Invitation) {
    Object.assign(this, invitation);
  }
}
