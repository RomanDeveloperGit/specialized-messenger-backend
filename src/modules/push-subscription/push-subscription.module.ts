import { Module } from '@nestjs/common';

import { PushSubscriptionController } from './push-subscription.controller';
import { PushSubscriptionService } from './push-subscription.service';

@Module({
  controllers: [PushSubscriptionController],
  providers: [PushSubscriptionService],
})
export class PushSubscriptionModule {}
