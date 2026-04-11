import { IsString, IsUUID, MinLength } from 'class-validator';

import { InvitationId } from './invitation.dto';

export class ApplyInvitationParams {
  @IsUUID()
  id: InvitationId;
}

export class ApplyInvitationRequest {
  @IsString()
  login: string;

  @IsString()
  @MinLength(6)
  password: string;
}
