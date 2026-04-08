import { Global, Module } from '@nestjs/common';
import { ConfigModule as _ConfigModule } from '@nestjs/config';

import { configFactory } from './config.factory';
import { ConfigService } from './config.service';
import { CONFIG_VALIDATION_SCHEMA } from './config.validation';

@Global()
@Module({
  imports: [
    _ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [configFactory],
      validationSchema: CONFIG_VALIDATION_SCHEMA,
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
