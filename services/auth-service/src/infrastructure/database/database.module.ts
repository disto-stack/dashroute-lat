import { Global, Module, OnApplicationShutdown, Inject } from '@nestjs/common';
import pg from 'pg';
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
    console.log('🔒 Closing PostgreSQL database connection pool...');
    await this.pool.end();
  }
}

