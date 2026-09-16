import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetOrdersUseCase } from '../../../src/application/use-cases/get-orders.use-case.js';
import { type IOrderRepository } from '../../../src/domain/ports/order-repository.port.js';
import { type AuthenticatedUser } from '../../../src/infrastructure/http/guards/jwt-auth.guard.js';

describe('GetOrdersUseCase', () => {
  let useCase: GetOrdersUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      search: vi.fn().mockResolvedValue({
        data: [],
        nextCursor: null,
        hasNextPage: false,
      }),
    };

    useCase = new GetOrdersUseCase(mockRepo as unknown as IOrderRepository);
  });

  it('should force customerId filter when user role is CUSTOMER', async () => {
    const customerUser: AuthenticatedUser = {
      id: 'customer-123',
      email: 'customer@dashroute.com',
      role: 'CUSTOMER',
    };

    await useCase.execute({ limit: 10, customerId: 'other-id' }, customerUser);

    expect(mockRepo.search).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 'customer-123',
      }),
      { limit: 10, cursor: undefined },
    );
  });

  it('should allow ADMIN to filter by any customerId and courierId', async () => {
    const adminUser: AuthenticatedUser = {
      id: 'admin-1',
      email: 'admin@dashroute.com',
      role: 'ADMIN',
    };

    await useCase.execute(
      { limit: 20, customerId: 'customer-456', courierId: 'courier-789' },
      adminUser,
    );

    expect(mockRepo.search).toHaveBeenCalledWith(
      {
        status: undefined,
        customerId: 'customer-456',
        courierId: 'courier-789',
      },
      { limit: 20, cursor: undefined },
    );
  });

  it('should pass pagination parameters correctly', async () => {
    const adminUser: AuthenticatedUser = {
      id: 'admin-1',
      email: 'admin@dashroute.com',
      role: 'ADMIN',
    };

    await useCase.execute({ limit: 5, cursor: 'base64cursor' }, adminUser);

    expect(mockRepo.search).toHaveBeenCalledWith(expect.anything(), {
      limit: 5,
      cursor: 'base64cursor',
    });
  });
});
