import { z } from 'zod';
import { defineTool, type SqlQueryable } from './ops-tool.js';

const PAYLOAD_ALLOWLIST = [
  'order_id',
  'orderId',
  'courier_id',
  'courierId',
  'status',
  'reason',
  'failedAt',
] as const;

const pickPayload = (payload: Record<string, unknown>) =>
  Object.fromEntries(
    PAYLOAD_ALLOWLIST.filter((k) => typeof payload?.[k] === 'string').map((k) => [k, payload[k]]),
  );

export const getOrderTimelineTool = (db: SqlQueryable) =>
  defineTool({
    name: 'get_order_timeline',
    description:
      'Chronological audit events for an order (event type, producer, timestamp and a few safe payload fields). Max 50 events.',
    inputSchema: { orderId: z.string().min(1).max(32) },
    handler: async ({ orderId }) => {
      const { rows } = await db.query<{
        event_type: string;
        producer: string;
        payload: Record<string, unknown>;
        created_at: Date;
      }>(
        `SELECT event_type, producer, payload, created_at
           FROM audit_logs WHERE order_id = $1
          ORDER BY created_at, id LIMIT 50`,
        [orderId],
      );
      return {
        events: rows.map((r) => ({
          eventType: r.event_type,
          producer: r.producer,
          at: r.created_at,
          payload: pickPayload(r.payload),
        })),
      };
    },
  });
