import type { Redis } from 'ioredis';

export interface NearbyCourier {
  courierId: string;
  distanceKm: number;
}

/** Narrow read-only view over Redis: tools never see a generic client (ADR 0021 §5). */
export class ReadonlyRedis {
  constructor(private readonly redis: Redis) {}

  async nearbyCouriers(
    lat: number,
    lng: number,
    radiusKm: number,
    count: number,
  ): Promise<NearbyCourier[]> {
    const res = (await this.redis.geosearch(
      'couriers:locations',
      'FROMLONLAT',
      lng,
      lat,
      'BYRADIUS',
      radiusKm,
      'km',
      'ASC',
      'COUNT',
      count,
      'WITHDIST',
    )) as [string, string][];
    return res.map(([courierId, dist]) => ({ courierId, distanceKm: Number(dist) }));
  }

  async courierStatus(courierId: string): Promise<string | null> {
    return this.redis.hget(`courier:status:${courierId}`, 'status');
  }

  /** Remaining lock TTL in seconds, or null when the courier is not locked. */
  async lockTtl(courierId: string): Promise<number | null> {
    const ttl = await this.redis.ttl(`courier:lock:${courierId}`);
    return ttl >= 0 ? ttl : null;
  }
}
