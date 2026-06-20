import { IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PushSubscriptionKeysRequest {
  @IsString()
  p256dh: string;

  @IsString()
  auth: string;
}

export class CreatePushSubscriptionRequest {
  @IsUrl()
  endpoint: string;

  @ValidateNested()
  @Type(() => PushSubscriptionKeysRequest)
  keys: PushSubscriptionKeysRequest;

  @IsOptional()
  @IsNumber()
  expirationTime?: number | null;
}
