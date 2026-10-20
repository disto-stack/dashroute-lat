import { z } from 'zod';
import { defineTool, type SqlQueryable } from './ops-tool.js';

export const getOrderTool = (db: SqlQueryable) =>
  defineTool({
    name: 'get_order',
    description:
      'Fetch an order by id: status, courier, pickup/dropoff coordinates, amount and timestamps.',
    inputSchema: { orderId: z.string().min(1).max(32) },
    handler: async ({ orderId }) => {
      const { rows } = await db.query(
        `SELECT id, customer_id, courier_id, status, pickup_location, dropoff_location,
                total_amount, currency, created_at, updated_at
           FROM orders WHERE id = $1`,
        [orderId],
      );
      return rows[0] ? { found: true, order: rows[0] } : { found: false };
    },
  });
