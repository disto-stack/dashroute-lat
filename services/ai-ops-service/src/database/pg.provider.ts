import pg from 'pg';

export function createReadonlyPool(env: NodeJS.ProcessEnv = process.env): pg.Pool {
  return new pg.Pool({
    host: env.DB_HOST ?? 'localhost',
    port: Number(env.DB_PORT ?? 5432),
    user: env.DB_USER ?? 'postgres',
    password: env.DB_PASSWORD ?? 'postgres',
    database: env.DB_NAME ?? 'dashroute',
    options: '-c role=ai_ops_ro',
    max: 4,
  });
}
