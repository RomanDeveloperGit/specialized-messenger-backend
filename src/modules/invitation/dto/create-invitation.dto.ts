import { IsString } from 'class-validator';

export class CreateInvitationRequest {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
