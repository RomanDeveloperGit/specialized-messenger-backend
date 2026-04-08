import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AuthModule } from '@/modules/auth/auth.module';

import { ConfigModule } from '@/shared/modules/config';
import { PrismaModule } from '@/shared/modules/prisma';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
