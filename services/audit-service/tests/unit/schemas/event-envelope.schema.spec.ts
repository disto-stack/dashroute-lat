import { describe, it, expect } from 'vitest';
import { parseEventEnvelope, extractOrderId } from '../../../src/schemas/event-envelope.schema.js';

describe('EventEnvelope Schema & Utilities', () => {
  it('should successfully parse a valid EventEnvelope', () => {
    const validEnvelope = {
      event_id: '123e4567-e89b-12d3-a456-426614174000',
      event_type: 'order.created',
      occurred_at: '2026-09-15T20:00:00Z',
      version: '1.0',
      producer: 'orders-service',
      payload: { order_id: 'ORD-100' },
    };

    const result = parseEventEnvelope(validEnvelope);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validEnvelope);
  });

  it('should fail parsing when missing required fields', () => {
    const invalidEnvelope = {
      event_type: 'order.created',
    };

    const result = parseEventEnvelope(invalidEnvelope);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should extract order_id from payload.order_id if present', () => {
    const event = {
      event_id: 'evt-1',
      event_type: 'order.created',
      producer: 'orders-service',
      payload: { order_id: 'ORD-42' },
    };

    expect(extractOrderId(event)).toBe('ORD-42');
  });

  it('should extract order_id from payload.id if event_type starts with order.', () => {
    const event = {
      event_id: 'evt-2',
      event_type: 'order.updated',
      producer: 'orders-service',
      payload: { id: 'ORD-99' },
    };

    expect(extractOrderId(event)).toBe('ORD-99');
  });

  it('should return null if no order_id can be inferred', () => {
    const event = {
      event_id: 'evt-3',
      event_type: 'user.registered',
      producer: 'auth-service',
      payload: { user_id: 'USR-1' },
    };

    expect(extractOrderId(event)).toBe(null);
  });
});
