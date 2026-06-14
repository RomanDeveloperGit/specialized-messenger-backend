import { IsString, IsUUID } from 'class-validator';

import { PublicId } from '@/shared/libs/ids';

export class GetInvitationByPublicIdParams {
  @IsUUID('7')
  id: PublicId;
}

export class GetInvitationByPublicIdQuery {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
