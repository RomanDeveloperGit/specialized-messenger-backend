import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBasicAuth } from '@nestjs/swagger';

import { AuthGuard } from '@/modules/auth/auth.guard';

import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  async getAll() {
    return await this.userService.getAll();
  }
}
