import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AcceptOrderUseCase } from '../../../../src/application/use-cases/accept-order.use-case.js';
import { type IOrderRepository } from '../../../../src/domain/ports/order-repository.port.js';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Order } from '../../../../src/domain/entities/order.entity.js';

describe('AcceptOrderUseCase', () => {
  let useCase: AcceptOrderUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      updateStatus: vi.fn(),
    };

    useCase = new AcceptOrderUseCase(mockRepo as unknown as IOrderRepository);
  });

  it('should accept an ASSIGNED order successfully when invoked by the assigned courier', async () => {
    const assignedOrder = new Order(
      'order-1',
      'customer-1',
      'ASSIGNED',
      { lat: 0, lng: 0 },
      { lat: 1, lng: 1 },
      new Date(),
      new Date(),
      'courier-999',
    );

    mockRepo.findById.mockResolvedValue(assignedOrder);
    mockRepo.updateStatus.mockResolvedValue({
      ...assignedOrder,
      status: 'ACCEPTED',
    });

    const result = await useCase.execute('order-1', 'courier-999');

    expect(mockRepo.findById).toHaveBeenCalledWith('order-1');
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('order-1', 'ACCEPTED', 'courier-999');
    expect(result.status).toBe('ACCEPTED');
  });

  it('should throw NotFoundException when order does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-order', 'courier-999')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException when requested by a courier other than assigned courier', async () => {
    const assignedOrder = new Order(
      'order-1',
      'customer-1',
      'ASSIGNED',
      { lat: 0, lng: 0 },
      { lat: 1, lng: 1 },
      new Date(),
      new Date(),
      'courier-999',
    );

    mockRepo.findById.mockResolvedValue(assignedOrder);

    await expect(useCase.execute('order-1', 'other-courier-123')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw BadRequestException when order is in invalid state for accepting', async () => {
    const pendingOrder = new Order(
      'order-1',
      'customer-1',
      'PENDING',
      { lat: 0, lng: 0 },
      { lat: 1, lng: 1 },
      new Date(),
      new Date(),
      null,
    );

    mockRepo.findById.mockResolvedValue(pendingOrder);

    await expect(useCase.execute('order-1', 'courier-999')).rejects.toThrow(
      ForbiddenException, // because courierId mismatch null !== courier-999
    );

    const deliveredOrder = new Order(
      'order-1',
      'customer-1',
      'DELIVERED',
      { lat: 0, lng: 0 },
      { lat: 1, lng: 1 },
      new Date(),
      new Date(),
      'courier-999',
    );

    mockRepo.findById.mockResolvedValue(deliveredOrder);

    await expect(useCase.execute('order-1', 'courier-999')).rejects.toThrow(
      BadRequestException,
    );
  });
});
