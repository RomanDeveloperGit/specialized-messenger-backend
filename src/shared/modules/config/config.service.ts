import { Injectable } from '@nestjs/common';
import { ConfigService as _ConfigService } from '@nestjs/config';

import { Config } from './config.types';

@Injectable()
export class ConfigService extends _ConfigService<Config> {
  // It's a mistake (The L principe from SOLID)
  get<K extends keyof Config>(propertyPath: K): Config[K] {
    return super.get(propertyPath)!;
  }
}
