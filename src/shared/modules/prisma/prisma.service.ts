import { Injectable } from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg';

import { ConfigService } from '@/shared/modules/config';
import { PrismaClient } from '@/shared/modules/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private configService: ConfigService) {
    const adapter = new PrismaPg({ connectionString: configService.get('databaseUrl') });

    super({ adapter });
  }
}
