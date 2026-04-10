import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import * as yaml from 'js-yaml';

import { ConfigService } from '@/shared/modules/config';
import { WSAdapter } from '@/shared/modules/ws';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: configService.get('consumerOrigin'),
    credentials: false,
  });

  if (configService.get('hasDocs')) {
    const swaggerConfig = new DocumentBuilder()
      .addBasicAuth()
      .setTitle('Specialized Messenger')
      .setDescription('Backend API docs')
      .setExternalDoc('Prisma entities docs', 'docs/prisma')
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, swaggerDocument);

    const prismaEntitiesDocument = yaml.load(
      readFileSync(
        join(process.cwd(), './src/shared/modules/generated/prisma-docs/openapi.yaml'),
        'utf8',
      ),
    ) as OpenAPIObject;
    SwaggerModule.setup('docs/prisma', app, prismaEntitiesDocument);
  }

  // TODO: Хот релоад аксепт добавить в нест

  app.useWebSocketAdapter(new WSAdapter(app, configService));

  await app.listen(configService.get('httpPort'));
}

bootstrap();
