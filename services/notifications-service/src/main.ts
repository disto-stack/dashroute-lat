import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  const port = process.env.PORT ?? 4004;
  await app.listen(port);
  logger.log(`Notifications Service running on port ${port}`, 'Bootstrap');
}
await bootstrap();
