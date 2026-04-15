import { IsString, IsUUID, MinLength } from 'class-validator';

import { PublicId } from '@/shared/libs/ids';

export class AcceptInvitationByPublicIdParams {
  @IsUUID()
  id: PublicId;
}

export class AcceptInvitationByPublicIdRequest {
  @IsString()
  login: string;

  @IsString()
  @MinLength(6)
  password: string;
}
