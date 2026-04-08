import { Module } from '@nestjs/common';

import { UserService } from './user.service';

@Module({
  imports: [],
  providers: [UserService],
  controllers: [],
})
export class UserModule {}
