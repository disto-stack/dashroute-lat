import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  const port = process.env.PORT || 4002;
  await app.listen(port);
  Logger.log(`Orders Service is running on: http://localhost:${port}`);
}
bootstrap();
