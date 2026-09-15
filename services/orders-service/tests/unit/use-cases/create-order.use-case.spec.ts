import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateOrderUseCase } from '../../../src/application/use-cases/create-order.use-case.js';
import { type RabbitMQPublisherService } from '../../../src/infrastructure/messaging/rabbitmq-publisher.service.js';
import { type IOrderRepository } from '../../../src/domain/ports/order-repository.port.js';
import { randomUUID } from 'crypto';

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let mockPublisher: any;
  let mockRepo: any;

  beforeEach(() => {
    mockPublisher = { publish: vi.fn() };
    mockRepo = {
      create: vi.fn().mockImplementation(async (orderData) => ({
        ...orderData,
        id: randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        courierId: null,
      })),
    };

    useCase = new CreateOrderUseCase(
      mockRepo as unknown as IOrderRepository,
      mockPublisher as unknown as RabbitMQPublisherService
    );
  });

  it('should create an order via repo and publish an event', async () => {
    const dto = {
      pickupLocation: { lat: 40, lng: -74 },
      dropoffLocation: { lat: 41, lng: -75 },
    };
    const customerId = randomUUID();

    const result = await useCase.execute(dto, customerId);

    expect(result).toBeDefined();
    expect(result.customerId).toBe(customerId);
    expect(result.status).toBe('PENDING');
    
    expect(mockRepo.create).toHaveBeenCalledWith({
      customerId,
      status: 'PENDING',
      pickupLocation: dto.pickupLocation,
      dropoffLocation: dto.dropoffLocation,
    });
    expect(mockPublisher.publish).toHaveBeenCalledWith('order.created', result);
  });

  it('should log error and rethrow when publisher fails', async () => {
    mockPublisher.publish.mockImplementationOnce(() => {
      throw new Error('RabbitMQ connection lost');
    });

    const dto = {
      pickupLocation: { lat: 40, lng: -74 },
      dropoffLocation: { lat: 41, lng: -75 },
    };
    const customerId = randomUUID();

    await expect(useCase.execute(dto, customerId)).rejects.toThrow('RabbitMQ connection lost');
  });
});

