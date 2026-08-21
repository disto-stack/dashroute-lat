import 'reflect-metadata';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT || 4001;
  await app.listen(port);
  Logger.log(`Auth Service running on port ${port}`, 'Bootstrap');
}

bootstrap();
