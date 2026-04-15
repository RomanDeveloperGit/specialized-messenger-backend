import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { Id, PublicId } from '@/shared/libs/ids';
import { User as _User, UserRole } from '@/shared/modules/generated/prisma/client';

export class User implements Omit<_User, 'id' | 'password'> {
  @Expose()
  id: Id;

  @Expose()
  publicId: PublicId;

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
    Object.assign(this, {
      ...user,
      id: user.id.toString(),
    });
  }
}
