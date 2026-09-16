import { describe, it, expect, vi } from 'vitest';
import type pg from 'pg';
import { AuditRepository } from '../../../src/database/audit-repository.js';
import { type EventEnvelope } from '../../../src/schemas/event-envelope.schema.js';

describe('AuditRepository', () => {
  const sampleEvent: EventEnvelope = {
    event_id: 'evt-100',
    event_type: 'order.created',
    producer: 'orders-service',
    payload: { order_id: 'ORD-123' },
  };

  it('should insert audit log into database successfully', async () => {
    const mockPool = {
      query: vi.fn().mockResolvedValue({ rowCount: 1 }),
    } as unknown as pg.Pool;

    const repository = new AuditRepository({ pool: mockPool });
    const result = await repository.saveAuditLog(sampleEvent);

    expect(result).toBe('inserted');
    expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO audit_logs'), [
      'evt-100',
      'ORD-123',
      'order.created',
      'orders-service',
      '{"order_id":"ORD-123"}',
    ]);
  });

  it('should return duplicate when DB returns code 23505', async () => {
    const dbErr = Object.assign(new Error('duplicate key value violates unique constraint'), {
      code: '23505',
    });

    const mockPool = {
      query: vi.fn().mockRejectedValue(dbErr),
    } as unknown as pg.Pool;

    const repository = new AuditRepository({ pool: mockPool });
    const result = await repository.saveAuditLog(sampleEvent);

    expect(result).toBe('duplicate');
  });

  it('should rethrow unexpected database errors', async () => {
    const dbErr = new Error('Database connection lost');

    const mockPool = {
      query: vi.fn().mockRejectedValue(dbErr),
    } as unknown as pg.Pool;

    const repository = new AuditRepository({ pool: mockPool });
    await expect(repository.saveAuditLog(sampleEvent)).rejects.toThrow('Database connection lost');
  });
});
