import { IsString, MinLength } from 'class-validator';

import {
  GetInvitationByPublicIdParams,
  GetInvitationByPublicIdQuery,
} from './get-invitation-by-public-id.dto';

export class AcceptInvitationByPublicIdParams extends GetInvitationByPublicIdParams {}

export class AcceptInvitationByPublicIdRequest {
  @IsString()
  login: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class AcceptInvitationByPublicIdQuery extends GetInvitationByPublicIdQuery {}
