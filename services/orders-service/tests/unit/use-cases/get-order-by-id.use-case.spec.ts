import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetOrderByIdUseCase } from '../../../src/application/use-cases/get-order-by-id.use-case.js';
import { type IOrderRepository } from '../../../src/domain/ports/order-repository.port.js';
import { type CaslAbilityFactory } from '../../../src/infrastructure/casl/casl-ability.factory.js';
import { type AuthenticatedUser } from '../../../src/infrastructure/http/guards/jwt-auth.guard.js';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Order } from '../../../src/domain/entities/order.entity.js';

describe('GetOrderByIdUseCase', () => {
  let useCase: GetOrderByIdUseCase;
  let mockRepo: any;
  let mockCaslFactory: any;

  const mockOrder = new Order(
    'order-100',
    'customer-1',
    'PENDING',
    { lat: 0, lng: 0 },
    { lat: 1, lng: 1 },
    new Date(),
    new Date(),
  );

  const mockUser: AuthenticatedUser = {
    id: 'customer-1',
    email: 'test@dashroute.com',
    role: 'CUSTOMER',
  };

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
    };
    mockCaslFactory = {
      createForUser: vi.fn(),
    };

    useCase = new GetOrderByIdUseCase(
      mockRepo as unknown as IOrderRepository,
      mockCaslFactory as unknown as CaslAbilityFactory,
    );
  });

  it('should return the order when it exists and user has permission', async () => {
    mockRepo.findById.mockResolvedValue(mockOrder);
    mockCaslFactory.createForUser.mockReturnValue({
      can: vi.fn().mockReturnValue(true),
    });

    const result = await useCase.execute('order-100', mockUser);

    expect(result).toEqual(mockOrder);
    expect(mockRepo.findById).toHaveBeenCalledWith('order-100');
  });

  it('should throw NotFoundException when order does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('order-999', mockUser)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when CASL ability denies permission', async () => {
    mockRepo.findById.mockResolvedValue(mockOrder);
    mockCaslFactory.createForUser.mockReturnValue({
      can: vi.fn().mockReturnValue(false),
    });

    await expect(useCase.execute('order-100', mockUser)).rejects.toThrow(ForbiddenException);
  });
});
