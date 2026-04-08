import { Module } from '@nestjs/common';

import { UserService } from '@/modules/user/user.service';

import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';

@Module({
  controllers: [InvitationController],
  providers: [InvitationService, UserService],
})
export class InvitationModule {}
