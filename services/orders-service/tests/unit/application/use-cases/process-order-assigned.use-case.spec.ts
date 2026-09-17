import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessOrderAssignedUseCase } from '../../../../src/application/use-cases/process-order-assigned.use-case.js';
import { type IOrderRepository } from '../../../../src/domain/ports/order-repository.port.js';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Order } from '../../../../src/domain/entities/order.entity.js';

describe('ProcessOrderAssignedUseCase', () => {
  let useCase: ProcessOrderAssignedUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      updateStatus: vi.fn(),
    };

    useCase = new ProcessOrderAssignedUseCase(mockRepo as unknown as IOrderRepository);
  });

  it('should process assignment successfully for a PENDING order', async () => {
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
      status: 'ASSIGNED',
      courierId: 'courier-999',
    });

    const event = {
      orderId: 'order-1',
      courierId: 'courier-999',
    };

    await useCase.execute(event);

    expect(mockRepo.findById).toHaveBeenCalledWith('order-1');
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('order-1', 'ASSIGNED', 'courier-999');
  });

  it('should throw NotFoundException when order does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ orderId: 'non-existent', courierId: 'courier-1' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when order is in an invalid state for assignment', async () => {
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

    await expect(useCase.execute({ orderId: 'order-1', courierId: 'courier-999' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
