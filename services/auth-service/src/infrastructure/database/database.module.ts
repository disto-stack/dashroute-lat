import { Global, Module, OnApplicationShutdown, Inject } from '@nestjs/common';
import pg from 'pg';
import { databaseProviders, DRIZZLE_DB, PG_POOL } from './database.provider.js';

@Global()
@Module({
  providers: [...databaseProviders],
  exports: [DRIZZLE_DB, PG_POOL],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private pool: pg.Pool) {}

  async onApplicationShutdown() {
    console.log('🔒 Closing PostgreSQL database connection pool...');
    await this.pool.end();
  }
}
