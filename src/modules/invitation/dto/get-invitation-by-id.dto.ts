import { IsUUID } from 'class-validator';

import { InvitationId } from './invitation.dto';

export class GetInvitationByIdParams {
  @IsUUID()
  id: InvitationId;
}
