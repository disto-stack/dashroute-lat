import type { ReadonlyRedis } from '../redis/readonly-redis.js';
import { getCourierSnapshotTool } from './get-courier-snapshot.tool.js';
import { getOrderTimelineTool } from './get-order-timeline.tool.js';
import { getOrderTool } from './get-order.tool.js';
import { getRecentDispatchFailuresTool } from './get-recent-dispatch-failures.tool.js';
import type { OpsTool, SqlQueryable } from './ops-tool.js';

export const buildOpsTools = (db: SqlQueryable, redis: ReadonlyRedis): OpsTool<any>[] => [
  getOrderTool(db),
  getOrderTimelineTool(db),
  getRecentDispatchFailuresTool(db),
  getCourierSnapshotTool(redis),
];
