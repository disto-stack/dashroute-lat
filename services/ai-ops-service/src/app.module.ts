import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { HealthController } from './http/health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        customProps: () => ({
          serviceName: 'ai-ops-service',
          environment: process.env.NODE_ENV || 'development',
        }),
        genReqId: (req) =>
          (req.headers['x-request-id'] as string) ||
          (req.headers['x-trace-id'] as string) ||
          crypto.randomUUID(),
      },
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
