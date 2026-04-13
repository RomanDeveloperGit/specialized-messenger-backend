import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { User as _User, UserRole } from '@/shared/modules/generated/prisma/client';

export type UserId = _User['id'];

export class User implements Omit<_User, 'password'> {
  @Expose()
  id: UserId;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  login: string;

  @Expose()
  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor({ password, ...user }: _User) {
    Object.assign(this, user);
  }
}
