import { IsUrl } from 'class-validator';

export class DeletePushSubscriptionQuery {
  @IsUrl()
  endpoint: string;
}
