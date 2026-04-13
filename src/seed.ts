import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // your seed code...

  console.log('Seeding complete!');

  await app.close();
}

bootstrap();
