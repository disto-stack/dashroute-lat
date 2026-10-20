import { z } from 'zod';
import type { ReadonlyRedis } from '../redis/readonly-redis.js';
import { defineTool } from './ops-tool.js';

export const getCourierSnapshotTool = (
  redis: Pick<ReadonlyRedis, 'nearbyCouriers' | 'courierStatus' | 'lockTtl'>,
) =>
  defineTool({
    name: 'get_courier_snapshot',
    description:
      'Current state (not state at failure time) of the couriers the dispatch engine would consider near a point: distance, status and lock.',
    inputSchema: {
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      radiusKm: z.number().positive().max(10).default(3),
    },
    handler: async ({ lat, lng, radiusKm }) => {
      const nearby = await redis.nearbyCouriers(lat, lng, radiusKm, 5);
      const couriers = await Promise.all(
        nearby.map(async ({ courierId, distanceKm }) => {
          const [status, lockTtlSeconds] = await Promise.all([
            redis.courierStatus(courierId),
            redis.lockTtl(courierId),
          ]);
          return { courierId, distanceKm, status, locked: lockTtlSeconds !== null, lockTtlSeconds };
        }),
      );
      return { radiusKm, couriersFound: couriers.length, couriers };
    },
  });
