import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT || 4001;
  await app.listen(port);
  Logger.log(`Auth Service running on port ${port}`, 'Bootstrap');
}

bootstrap();
