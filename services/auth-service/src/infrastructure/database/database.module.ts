import { Global, Module, type OnApplicationShutdown, Inject, Logger } from '@nestjs/common';
import type pg from 'pg';
import { databaseProviders, DRIZZLE_DB, PG_POOL } from './database.provider.js';
import { USER_REPOSITORY_PORT } from '../../domain/ports/user-repository.port.js';
import { DrizzleUserRepository } from './repositories/drizzle-user.repository.js';

@Global()
@Module({
  providers: [
    ...databaseProviders,
    {
      provide: USER_REPOSITORY_PORT,
      useClass: DrizzleUserRepository,
    },
  ],
  exports: [DRIZZLE_DB, PG_POOL, USER_REPOSITORY_PORT],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private pool: pg.Pool) {}

  async onApplicationShutdown() {
    Logger.log('🔒 Closing PostgreSQL database connection pool...', 'DatabaseModule');
    await this.pool.end();
  }
}
