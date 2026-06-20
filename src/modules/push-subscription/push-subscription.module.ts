import { Module } from '@nestjs/common';

import { UserService } from '@/modules/user/user.service';

import { PushSubscriptionController } from './push-subscription.controller';
import { PushSubscriptionService } from './push-subscription.service';

@Module({
  controllers: [PushSubscriptionController],
  providers: [PushSubscriptionService, UserService],
})
export class PushSubscriptionModule {}
