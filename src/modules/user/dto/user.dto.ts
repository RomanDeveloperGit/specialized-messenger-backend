import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { Id, PublicId } from '@/shared/libs/ids';
import { User as _User } from '@/shared/modules/generated/prisma/client';
import { UserGetPayload, UserInclude } from '@/shared/modules/generated/prisma/models';

import { UserRole } from './user-role.dto';

const userInclude = {
  role: true,
} satisfies UserInclude;

type PopulatedUser = UserGetPayload<{
  include: typeof userInclude;
}>;

export class User implements Omit<_User, 'id' | 'password' | 'roleId'> {
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
    type: UserRole,
  })
  role: UserRole;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor({ password, roleId, ...user }: PopulatedUser) {
    Object.assign(this, {
      ...user,
      id: user.id.toString(),
      role: new UserRole(user.role),
    });
  }
}
