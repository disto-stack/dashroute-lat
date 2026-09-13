import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RabbitMQPublisherService } from '../../../../src/infrastructure/messaging/rabbitmq-publisher.service.js';
import { type AmqpConnection } from '@golevelup/nestjs-rabbitmq';

describe('RabbitMQPublisherService', () => {
  let service: RabbitMQPublisherService;
  let mockAmqp: any;

  beforeEach(() => {
    mockAmqp = {
      publish: vi.fn(),
    };
    service = new RabbitMQPublisherService(mockAmqp as unknown as AmqpConnection);
  });

  it('should publish message to dashroute.events exchange with specified routing key', () => {
    const payload = { orderId: 'ord-123', status: 'PENDING' };
    service.publish('order.created', payload);

    expect(mockAmqp.publish).toHaveBeenCalledWith('dashroute.events', 'order.created', payload);
  });
});
