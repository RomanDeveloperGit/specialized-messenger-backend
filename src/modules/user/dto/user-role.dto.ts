import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { Id } from '@/shared/libs/ids';
import { UserRole as _UserRole, UserRoleName } from '@/shared/modules/generated/prisma/client';

export class UserRole implements Omit<_UserRole, 'id'> {
  @Expose()
  id: Id;

  @Expose()
  @ApiProperty({
    enum: UserRoleName,
  })
  name: UserRoleName;

  @Expose()
  createdAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(userRole: _UserRole) {
    Object.assign(this, {
      ...userRole,
      id: userRole.id.toString(),
    });
  }
}
