import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../../src/infrastructure/database/schema.js';
import { DrizzleOrderRepository } from '../../../../../src/infrastructure/database/repositories/drizzle-order.repository.js';
import { randomUUID } from 'crypto';

describe('DrizzleOrderRepository (Integration)', () => {
  let pool: Pool;
  let db: any;
  let repository: DrizzleOrderRepository;
  let isDbAvailable = false;

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'dashroute',
      connectionTimeoutMillis: 2000,
    });

    try {
      const client = await pool.connect();
      client.release();
      isDbAvailable = true;
      db = drizzle(pool, { schema });
      repository = new DrizzleOrderRepository(db);
    } catch {
      console.warn('PostgreSQL is not reachable. Integration tests for DrizzleOrderRepository will be skipped.');
      isDbAvailable = false;
    }
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  const ensureUser = async (userId: string) => {
    await pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
      [userId, `${userId}@test.com`, 'hash', 'Test User', 'CUSTOMER']
    );
  };

  it('should create and retrieve an order from PostgreSQL', async () => {
    if (!isDbAvailable) return;

    const customerId = 'usr_' + randomUUID().replace(/-/g, '').slice(0, 24);
    await ensureUser(customerId);

    const created = await repository.create({
      customerId,
      status: 'PENDING',
      pickupLocation: { lat: 40.7128, lng: -74.006 },
      dropoffLocation: { lat: 40.7306, lng: -73.9352 },
    });

    expect(created.id).toBeDefined();
    expect(created.customerId).toBe(customerId);
    expect(created.status).toBe('PENDING');

    const found = await repository.findById(created.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);
  });

  const ensureCourier = async (courierId: string, userId: string) => {
    await ensureUser(userId);
    await pool.query(
      `INSERT INTO couriers (id, user_id, vehicle_type) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
      [courierId, userId, 'MOTORCYCLE']
    );
  };

  it('should update status and courierId in PostgreSQL', async () => {
    if (!isDbAvailable) return;

    const customerId = 'usr_' + randomUUID().replace(/-/g, '').slice(0, 24);
    const courierUserId = 'usr_' + randomUUID().replace(/-/g, '').slice(0, 24);
    const courierId = 'cur_' + randomUUID().replace(/-/g, '').slice(0, 24);
    
    await ensureUser(customerId);
    await ensureCourier(courierId, courierUserId);

    const created = await repository.create({
      customerId,
      status: 'PENDING',
      pickupLocation: { lat: 10, lng: 10 },
      dropoffLocation: { lat: 20, lng: 20 },
    });

    const updated = await repository.updateStatus(created.id, 'ASSIGNED', courierId);
    expect(updated.status).toBe('ASSIGNED');
    expect(updated.courierId).toBe(courierId);
  });
});
