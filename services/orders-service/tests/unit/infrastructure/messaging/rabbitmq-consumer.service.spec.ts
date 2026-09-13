import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RabbitMQConsumerService } from '../../../../src/infrastructure/messaging/rabbitmq-consumer.service.js';
import { type ProcessOrderAssignedUseCase } from '../../../../src/application/use-cases/process-order-assigned.use-case.js';

describe('RabbitMQConsumerService', () => {
  let service: RabbitMQConsumerService;
  let mockUseCase: any;

  beforeEach(() => {
    mockUseCase = {
      execute: vi.fn(),
    };
    service = new RabbitMQConsumerService(mockUseCase as unknown as ProcessOrderAssignedUseCase);
  });

  it('should parse valid delivery.assigned message and execute use case', async () => {
    const validMsg = {
      orderId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      courierId: 'e47ac10b-58cc-4372-a567-0e02b2c3d478',
    };

    await service.handleDeliveryAssigned(validMsg);

    expect(mockUseCase.execute).toHaveBeenCalledWith(validMsg);
  });

  it('should catch Zod validation error for invalid message without throwing or calling use case', async () => {
    const invalidMsg = {
      orderId: 'invalid-uuid',
      // missing courierId
    };

    await service.handleDeliveryAssigned(invalidMsg);

    expect(mockUseCase.execute).not.toHaveBeenCalled();
  });
});
