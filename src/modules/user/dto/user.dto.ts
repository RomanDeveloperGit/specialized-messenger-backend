import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import { Exclude, Expose } from 'class-transformer';

import { User as _User, UserRole } from '@/shared/modules/generated/prisma/client';

export class User implements _User {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  login: string;

  @Exclude()
  @ApiHideProperty()
  password: never;

  @Expose()
  @ApiProperty({
    enum: UserRole,
  })
  role: UserRole;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(user: _User) {
    Object.assign(this, user);
  }
}
