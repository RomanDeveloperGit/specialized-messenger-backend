import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import { Exclude, Expose } from 'class-transformer';

import { Role, User } from '@/shared/modules/generated/prisma/client';

export class AuthorizedUser implements User {
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
  password: string;

  @Expose()
  @ApiProperty({
    enum: Role,
  })
  role: Role;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(user: User) {
    Object.assign(this, user);
  }
}
