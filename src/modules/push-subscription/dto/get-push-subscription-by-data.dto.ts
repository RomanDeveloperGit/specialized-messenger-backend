import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetPushSubscriptionByDataQuery {
  @IsString()
  endpoint: string;

  @IsString()
  p256dh: string;

  @IsString()
  auth: string;

  @IsOptional()
  @IsNumber()
  expirationTime?: number | null;
}
