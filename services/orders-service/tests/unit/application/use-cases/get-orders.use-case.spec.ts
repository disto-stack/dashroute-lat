import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetOrdersUseCase } from '../../../../src/application/use-cases/get-orders.use-case.js';
import { type IOrderRepository } from '../../../../src/domain/ports/order-repository.port.js';
import { type AuthenticatedUser } from '../../../../src/infrastructure/http/guards/jwt-auth.guard.js';

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

  it('should force courierId filter with the courier id (not the user id) when user role is COURIER', async () => {
    const courierUser: AuthenticatedUser = {
      id: 'usr-courier-1',
      email: 'courier@dashroute.com',
      role: 'COURIER',
      courierId: 'cur-courier-1',
    };

    await useCase.execute({ limit: 10, courierId: 'other-id' }, courierUser);

    expect(mockRepo.search).toHaveBeenCalledWith(
      expect.objectContaining({ courierId: 'cur-courier-1' }),
      { limit: 10, cursor: undefined },
    );
  });

  it('should return an empty page for a COURIER without a courier profile', async () => {
    const courierUser: AuthenticatedUser = {
      id: 'usr-courier-1',
      email: 'courier@dashroute.com',
      role: 'COURIER',
    };

    const result = await useCase.execute({ limit: 10 }, courierUser);

    expect(result).toEqual({ data: [], nextCursor: null, hasNextPage: false });
    expect(mockRepo.search).not.toHaveBeenCalled();
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
