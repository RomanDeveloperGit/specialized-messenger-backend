import { Controller, Get } from '@nestjs/common';

import { AuthGuard } from '@/modules/auth/auth.guard';

import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @AuthGuard()
  async getAll() {
    return await this.userService.getAll();
  }
}
