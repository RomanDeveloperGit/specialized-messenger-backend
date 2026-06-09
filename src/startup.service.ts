import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { UserService } from './modules/user/user.service';

@Injectable()
export class StartupService implements OnApplicationBootstrap {
  constructor(private readonly userService: UserService) {}

  async onApplicationBootstrap() {
    await this.userService.resetAllOnlineUsers(new Date());
  }
}
