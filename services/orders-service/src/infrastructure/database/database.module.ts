import { Global, Module } from '@nestjs/common';
import { databaseProviders } from './database.provider.js';
import { ORDER_REPOSITORY_PORT } from '../../domain/ports/order-repository.port.js';
import { DrizzleOrderRepository } from './repositories/drizzle-order.repository.js';

const repoProvider = {
  provide: ORDER_REPOSITORY_PORT,
  useClass: DrizzleOrderRepository,
};

@Global()
@Module({
  providers: [...databaseProviders, repoProvider],
  exports: [...databaseProviders, repoProvider],
})
export class DatabaseModule {}
