import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { CaslModule } from './infrastructure/casl/casl.module.js';
import { RabbitMQModule } from './infrastructure/messaging/rabbitmq.module.js';
import { OrdersController } from './infrastructure/http/controllers/orders.controller.js';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case.js';
import { GetOrdersUseCase } from './application/use-cases/get-orders.use-case.js';
import { GetOrderByIdUseCase } from './application/use-cases/get-order-by-id.use-case.js';
import { ProcessOrderAssignedUseCase } from './application/use-cases/process-order-assigned.use-case.js';
import { JwtAuthGuard } from './infrastructure/http/guards/jwt-auth.guard.js';

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
          serviceName: 'orders-service',
          environment: process.env.NODE_ENV || 'development',
        }),
        genReqId: (req) => (req.headers['x-request-id'] as string) || (req.headers['x-trace-id'] as string) || crypto.randomUUID(),
      },
    }),
    DatabaseModule, 
    CaslModule, 
    RabbitMQModule
  ],
  controllers: [OrdersController],
  providers: [
    CreateOrderUseCase,
    GetOrdersUseCase,
    GetOrderByIdUseCase,
    ProcessOrderAssignedUseCase,
    JwtAuthGuard,
  ],
})
export class AppModule {}

