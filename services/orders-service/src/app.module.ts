import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { CaslModule } from './infrastructure/casl/casl.module.js';
import { RabbitMQModule } from './infrastructure/messaging/rabbitmq.module.js';
import { OrdersController } from './infrastructure/http/controllers/orders.controller.js';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case.js';

import { GetOrdersUseCase } from './application/use-cases/get-orders.use-case.js';
import { GetOrderByIdUseCase } from './application/use-cases/get-order-by-id.use-case.js';
import { ProcessOrderAssignedUseCase } from './application/use-cases/process-order-assigned.use-case.js';

@Module({
  imports: [DatabaseModule, CaslModule, RabbitMQModule],
  controllers: [OrdersController],
  providers: [
    CreateOrderUseCase,
    GetOrdersUseCase,
    GetOrderByIdUseCase,
    ProcessOrderAssignedUseCase,
  ],
})
export class AppModule {}
