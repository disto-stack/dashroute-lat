import { z } from 'zod';
import { defineTool, type SqlQueryable } from './ops-tool.js';

export const getRecentDispatchFailuresTool = (db: SqlQueryable) =>
  defineTool({
    name: 'get_recent_dispatch_failures',
    description:
      'System-wide counts of created orders and dispatch failures in the last N minutes, to tell an isolated failure from a systemic one.',
    inputSchema: { windowMinutes: z.number().int().min(1).max(1440).default(60) },
    handler: async ({ windowMinutes }) => {
      const { rows } = await db.query<{
        orders_created: string;
        dispatch_failures: string;
        last_failure_at: Date | null;
      }>(
        `SELECT count(*) FILTER (WHERE event_type = 'order.created')         AS orders_created,
                count(*) FILTER (WHERE event_type = 'order.dispatch_failed') AS dispatch_failures,
                max(created_at) FILTER (WHERE event_type = 'order.dispatch_failed') AS last_failure_at
           FROM audit_logs
          WHERE created_at > now() - make_interval(mins => $1)`,
        [windowMinutes],
      );
      const r = rows[0];
      return {
        windowMinutes,
        ordersCreated: Number(r.orders_created),
        dispatchFailures: Number(r.dispatch_failures),
        lastFailureAt: r.last_failure_at,
      };
    },
  });
