import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AuthModule } from '@/modules/auth/auth.module';
import { ChatModule } from '@/modules/chat/chat.module';
import { InvitationModule } from '@/modules/invitation/invitation.module';
import { UserModule } from '@/modules/user/user.module';

import { ConfigModule } from '@/shared/modules/config';
import { PrismaModule } from '@/shared/modules/prisma';

@Module({
  imports: [ConfigModule, PrismaModule, UserModule, AuthModule, InvitationModule, ChatModule],
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
