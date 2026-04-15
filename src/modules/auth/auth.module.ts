import { Global, Module } from '@nestjs/common';

import { UserService } from '@/modules/user/user.service';

import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, UserService, AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
