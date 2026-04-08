import { IsString, MinLength } from 'class-validator';

export class ApplyInvitationRequest {
  @IsString()
  login: string;

  @IsString()
  @MinLength(6)
  password: string;
}
