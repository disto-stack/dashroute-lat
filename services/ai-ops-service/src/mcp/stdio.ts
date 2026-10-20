import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Redis } from 'ioredis';
import { createReadonlyPool } from '../database/pg.provider.js';
import { ReadonlyRedis } from '../redis/readonly-redis.js';
import { buildOpsTools } from '../tools/index.js';
import { createOpsMcpServer } from './ops-mcp-server.js';

const pool = createReadonlyPool();
const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379/0');

await createOpsMcpServer(buildOpsTools(pool, new ReadonlyRedis(redis))).connect(
  new StdioServerTransport(),
);
