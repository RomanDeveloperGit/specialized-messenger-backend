import { IsBoolean } from 'class-validator';

export class UpdateNotificationsStatusRequest {
  @IsBoolean()
  isNotificationsEnabled: boolean;
}
