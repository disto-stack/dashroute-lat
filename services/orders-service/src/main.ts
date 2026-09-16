import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.enableCors();

  const port = process.env.PORT || 4002;
  await app.listen(port);
  logger.log(`Orders Service is running on: http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
