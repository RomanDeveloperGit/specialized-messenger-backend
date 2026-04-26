import { INestApplicationContext } from '@nestjs/common';

import { IoAdapter } from '@nestjs/platform-socket.io';

import { ConfigService } from '@/shared/modules/config';

export class WSAdapter extends IoAdapter {
  private readonly port: number;
  private readonly options = {};

  constructor(app: INestApplicationContext, configService: ConfigService) {
    super(app);

    this.port = configService.get('wsPort');
    this.options = {
      cors: {
        origin: configService.get('consumerOrigin'),
        credentials: false,
      },
    };
  }

  createIOServer(port: number, options?: any) {
    return super.createIOServer(this.port, {
      ...options,
      ...this.options,
    });
  }
}
