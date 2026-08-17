import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetProfileUseCase } from '../../../src/application/use-cases/get-profile.use-case.js';
import { UserNotFoundException } from '../../../src/domain/exceptions/domain.exceptions.js';
import { User } from '../../../src/domain/entities/user.entity.js';
import { Courier } from '../../../src/domain/entities/courier.entity.js';
import { IUserRepository } from '../../../src/domain/ports/user-repository.port.js';

describe('GetProfileUseCase (Unit)', () => {
  let useCase: GetProfileUseCase;
  let mockUserRepo: IUserRepository;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      findCourierByUserId: vi.fn(),
      saveCustomer: vi.fn(),
      saveCourier: vi.fn(),
    };

    useCase = new GetProfileUseCase(mockUserRepo);
  });

  it('should return customer profile without courier details', async () => {
    const user = new User({
      id: 'usr_cust',
      email: 'cust@dashroute.com',
      passwordHash: 'hash',
      fullName: 'Customer User',
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(mockUserRepo.findById).mockResolvedValue(user);

    const result = await useCase.execute('usr_cust');

    expect(result.id).toBe('usr_cust');
    expect(result.courierProfile).toBeUndefined();
  });

  it('should return courier profile with courier details', async () => {
    const user = new User({
      id: 'usr_cur',
      email: 'courier@dashroute.com',
      passwordHash: 'hash',
      fullName: 'Courier User',
      role: 'COURIER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const courier = new Courier({
      id: 'cur_123',
      userId: 'usr_cur',
      vehicleType: 'VAN',
      plateNumber: 'VAN-777',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(mockUserRepo.findById).mockResolvedValue(user);
    vi.mocked(mockUserRepo.findCourierByUserId).mockResolvedValue(courier);

    const result = await useCase.execute('usr_cur');

    expect(result.id).toBe('usr_cur');
    expect(result.courierProfile).toMatchObject({
      vehicleType: 'VAN',
      plateNumber: 'VAN-777',
      isVerified: true,
    });
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    vi.mocked(mockUserRepo.findById).mockResolvedValue(null);

    await expect(useCase.execute('usr_nonexistent')).rejects.toThrow(UserNotFoundException);
  });
});
