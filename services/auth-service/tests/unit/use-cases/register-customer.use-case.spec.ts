import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterCustomerUseCase } from '../../../src/application/use-cases/register-customer.use-case.js';
import { UserAlreadyExistsException } from '../../../src/domain/exceptions/domain.exceptions.js';
import { IUserRepository } from '../../../src/domain/ports/user-repository.port.js';
import { IPasswordHasher } from '../../../src/domain/ports/password-hasher.port.js';
import { ITokenService } from '../../../src/domain/ports/token-service.port.js';

describe('RegisterCustomerUseCase (Unit)', () => {
  let useCase: RegisterCustomerUseCase;
  let mockUserRepo: IUserRepository;
  let mockHasher: IPasswordHasher;
  let mockTokenService: ITokenService;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      findCourierByUserId: vi.fn(),
      saveCustomer: vi.fn((user) => Promise.resolve(user)),
      saveCourier: vi.fn(),
    };

    mockHasher = {
      hash: vi.fn().mockResolvedValue('hashed_password_123'),
      verify: vi.fn(),
    };

    mockTokenService = {
      generateTokens: vi.fn().mockResolvedValue({
        accessToken: 'access_mock',
        refreshToken: 'refresh_mock',
      }),
      verifyAccessToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
    };

    useCase = new RegisterCustomerUseCase(mockUserRepo, mockHasher, mockTokenService);
  });

  it('should successfully register a customer and return tokens', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null);

    const result = await useCase.execute({
      email: 'newuser@dashroute.com',
      password: 'SecurePassword123!',
      fullName: 'New Customer',
    });

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('newuser@dashroute.com');
    expect(mockHasher.hash).toHaveBeenCalledWith('SecurePassword123!');
    expect(mockUserRepo.saveCustomer).toHaveBeenCalled();
    expect(mockTokenService.generateTokens).toHaveBeenCalled();

    expect(result.accessToken).toBe('access_mock');
    expect(result.refreshToken).toBe('refresh_mock');
    expect(result.user.email).toBe('newuser@dashroute.com');
    expect(result.user.role).toBe('CUSTOMER');
  });

  it('should throw UserAlreadyExistsException when email already exists', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue({} as any);

    await expect(
      useCase.execute({
        email: 'existing@dashroute.com',
        password: 'Password123!',
        fullName: 'Existing User',
      }),
    ).rejects.toThrow(UserAlreadyExistsException);

    expect(mockHasher.hash).not.toHaveBeenCalled();
    expect(mockUserRepo.saveCustomer).not.toHaveBeenCalled();
  });
});
