import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { SecurityModule } from './infrastructure/security/security.module.js';
import { CaslModule } from './infrastructure/casl/casl.module.js';
import { AuthHttpModule } from './infrastructure/http/auth-http.module.js';

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
          serviceName: 'auth-service',
          environment: process.env.NODE_ENV || 'development',
        }),
        genReqId: (req) =>
          (req.headers['x-request-id'] as string) ||
          (req.headers['x-trace-id'] as string) ||
          crypto.randomUUID(),
      },
    }),
    DatabaseModule,
    SecurityModule,
    CaslModule,
    AuthHttpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
