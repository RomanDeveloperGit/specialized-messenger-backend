import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { Id, PublicId } from '@/shared/libs/ids';
import { Invitation as _Invitation } from '@/shared/modules/generated/prisma/client';
import { InvitationGetPayload, InvitationInclude } from '@/shared/modules/generated/prisma/models';

import { InvitationStatus } from './invitation-status.dto';

const invitationInclude = {
  status: true,
} satisfies InvitationInclude;

type PopulatedInvitation = InvitationGetPayload<{
  include: typeof invitationInclude;
}>;
export class Invitation implements Omit<_Invitation, 'id' | 'authorUserId' | 'statusId'> {
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
    type: InvitationStatus,
  })
  status: InvitationStatus;

  @Expose()
  createdAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor({ statusId, ...invitation }: PopulatedInvitation) {
    Object.assign(this, {
      ...invitation,
      id: invitation.id.toString(),
      status: new InvitationStatus(invitation.status),
      authorUserId: invitation.authorUserId.toString(),
    });
  }
}
