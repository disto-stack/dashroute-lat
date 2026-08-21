import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterCourierUseCase } from '../../../src/application/use-cases/register-courier.use-case.js';
import { UserAlreadyExistsException } from '../../../src/domain/exceptions/domain.exceptions.js';
import { type User } from '../../../src/domain/entities/user.entity.js';
import { Courier } from '../../../src/domain/entities/courier.entity.js';
import { type IUserRepository } from '../../../src/domain/ports/user-repository.port.js';
import { type IPasswordHasher } from '../../../src/domain/ports/password-hasher.port.js';
import { type ITokenService } from '../../../src/domain/ports/token-service.port.js';

describe('RegisterCourierUseCase (Unit)', () => {
  let useCase: RegisterCourierUseCase;
  let mockUserRepo: IUserRepository;
  let mockHasher: IPasswordHasher;
  let mockTokenService: ITokenService;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      findCourierById: vi.fn(),
      findCourierByUserId: vi.fn(),
      saveCustomer: vi.fn(),
      saveCourier: vi.fn((user, courierParams) => {
        const courier = new Courier({
          id: 'cur_test123',
          userId: user.id,
          vehicleType: courierParams.vehicleType,
          plateNumber: courierParams.plateNumber,
          isVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return Promise.resolve({ user, courier });
      }),
      updateCourierVerification: vi.fn(),
    };

    mockHasher = {
      hash: vi.fn().mockResolvedValue('hashed_pw_courier'),
      verify: vi.fn(),
    };

    mockTokenService = {
      generateTokens: vi.fn().mockResolvedValue({
        accessToken: 'access_courier',
        refreshToken: 'refresh_courier',
      }),
      verifyAccessToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
    };

    useCase = new RegisterCourierUseCase(mockUserRepo, mockHasher, mockTokenService);
  });

  it('should successfully register a courier with vehicle profile', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null);

    const result = await useCase.execute({
      email: 'courier@dashroute.com',
      password: 'SecurePassword123!',
      fullName: 'John Courier',
      vehicleType: 'MOTORCYCLE',
      plateNumber: 'MOT-999',
    });

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('courier@dashroute.com');
    expect(mockHasher.hash).toHaveBeenCalledWith('SecurePassword123!');
    expect(mockUserRepo.saveCourier).toHaveBeenCalled();
    expect(mockTokenService.generateTokens).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'COURIER', courierId: 'cur_test123' }),
    );

    expect(result.accessToken).toBe('access_courier');
    expect(result.user.role).toBe('COURIER');
    expect(result.user.courierProfile).toMatchObject({
      vehicleType: 'MOTORCYCLE',
      plateNumber: 'MOT-999',
      isVerified: false,
    });
  });

  it('should throw UserAlreadyExistsException when courier email is taken', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue({} as User);

    await expect(
      useCase.execute({
        email: 'taken@dashroute.com',
        password: 'Password123!',
        fullName: 'Taken User',
        vehicleType: 'CAR',
      }),
    ).rejects.toThrow(UserAlreadyExistsException);
  });
});
