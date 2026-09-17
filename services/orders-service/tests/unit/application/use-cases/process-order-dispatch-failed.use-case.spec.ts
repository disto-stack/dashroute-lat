import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessOrderDispatchFailedUseCase } from '../../../../src/application/use-cases/process-order-dispatch-failed.use-case.js';
import { type IOrderRepository } from '../../../../src/domain/ports/order-repository.port.js';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Order } from '../../../../src/domain/entities/order.entity.js';

describe('ProcessOrderDispatchFailedUseCase', () => {
  let useCase: ProcessOrderDispatchFailedUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      updateStatus: vi.fn(),
    };

    useCase = new ProcessOrderDispatchFailedUseCase(mockRepo as unknown as IOrderRepository);
  });

  it('should process dispatch failure successfully for a PENDING order', async () => {
    const pendingOrder = new Order(
      'order-1',
      'customer-1',
      'PENDING',
      { lat: 0, lng: 0 },
      { lat: 1, lng: 1 },
      new Date(),
      new Date(),
    );

    mockRepo.findById.mockResolvedValue(pendingOrder);
    mockRepo.updateStatus.mockResolvedValue({
      ...pendingOrder,
      status: 'CANCELLED',
    });

    const event = {
      orderId: 'order-1',
      reason: 'NO_COURIERS_AVAILABLE',
    };

    await useCase.execute(event);

    expect(mockRepo.findById).toHaveBeenCalledWith('order-1');
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('order-1', 'CANCELLED', undefined);
  });

  it('should throw NotFoundException when order does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ orderId: 'non-existent', reason: 'TEST' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when order is in an invalid state for cancellation', async () => {
    const deliveredOrder = new Order(
      'order-1',
      'customer-1',
      'DELIVERED',
      { lat: 0, lng: 0 },
      { lat: 1, lng: 1 },
      new Date(),
      new Date(),
    );

    mockRepo.findById.mockResolvedValue(deliveredOrder);

    await expect(
      useCase.execute({ orderId: 'order-1', reason: 'LATE_FAILURE' })
    ).rejects.toThrow(BadRequestException);
  });
});
