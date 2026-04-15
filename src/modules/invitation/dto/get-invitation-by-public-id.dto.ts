import { IsUUID } from 'class-validator';

import { PublicId } from '@/shared/libs/ids';

export class GetInvitationByPublicIdParams {
  @IsUUID()
  id: PublicId;
}
