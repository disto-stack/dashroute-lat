import { describe, it, expect, vi } from 'vitest';
import type amqp from 'amqplib';
import { createMessageHandler } from '../../../src/broker/rabbitmq-consumer.js';
import { type AuditRepository } from '../../../src/database/audit-repository.js';

describe('RabbitMQ Consumer Message Handler', () => {
  const mockChannel = {
    ack: vi.fn(),
    nack: vi.fn(),
  } as unknown as amqp.Channel;

  it('should ignore null messages', async () => {
    const mockRepo = {
      saveAuditLog: vi.fn(),
    } as unknown as AuditRepository;

    const handler = createMessageHandler(mockRepo);
    await handler(null, mockChannel);

    expect(mockChannel.ack).not.toHaveBeenCalled();
    expect(mockChannel.nack).not.toHaveBeenCalled();
  });

  it('should NACK non-JSON malformed messages', async () => {
    const mockRepo = { saveAuditLog: vi.fn() } as unknown as AuditRepository;
    const handler = createMessageHandler(mockRepo);

    const msg = {
      content: Buffer.from('NOT_VALID_JSON'),
    } as amqp.ConsumeMessage;

    await handler(msg, mockChannel);

    expect(mockChannel.nack).toHaveBeenCalledWith(msg, false, false);
    expect(mockRepo.saveAuditLog).not.toHaveBeenCalled();
  });

  it('should NACK messages that do not match EventEnvelope schema', async () => {
    const mockRepo = { saveAuditLog: vi.fn() } as unknown as AuditRepository;
    const handler = createMessageHandler(mockRepo);

    const msg = {
      content: Buffer.from(JSON.stringify({ invalid: 'schema' })),
    } as amqp.ConsumeMessage;

    await handler(msg, mockChannel);

    expect(mockChannel.nack).toHaveBeenCalledWith(msg, false, false);
    expect(mockRepo.saveAuditLog).not.toHaveBeenCalled();
  });

  it('should ACK valid messages after saving to repository', async () => {
    const mockRepo = {
      saveAuditLog: vi.fn().mockResolvedValue('inserted'),
    } as unknown as AuditRepository;
    const handler = createMessageHandler(mockRepo);

    const validEvent = {
      event_id: 'evt-1',
      event_type: 'order.created',
      producer: 'orders-service',
      payload: { order_id: 'ORD-1' },
    };

    const msg = {
      content: Buffer.from(JSON.stringify(validEvent)),
    } as amqp.ConsumeMessage;

    await handler(msg, mockChannel);

    expect(mockRepo.saveAuditLog).toHaveBeenCalledWith(validEvent);
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it('should NACK messages on unexpected repository errors', async () => {
    const mockRepo = {
      saveAuditLog: vi.fn().mockRejectedValue(new Error('DB failure')),
    } as unknown as AuditRepository;
    const handler = createMessageHandler(mockRepo);

    const validEvent = {
      event_id: 'evt-1',
      event_type: 'order.created',
      producer: 'orders-service',
      payload: {},
    };

    const msg = {
      content: Buffer.from(JSON.stringify(validEvent)),
    } as amqp.ConsumeMessage;

    await handler(msg, mockChannel);

    expect(mockChannel.nack).toHaveBeenCalledWith(msg, false, false);
  });
});
