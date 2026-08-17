import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '../../../src/application/use-cases/login.use-case.js';
import { InvalidCredentialsException } from '../../../src/domain/exceptions/domain.exceptions.js';
import { User } from '../../../src/domain/entities/user.entity.js';
import { IUserRepository } from '../../../src/domain/ports/user-repository.port.js';
import { IPasswordHasher } from '../../../src/domain/ports/password-hasher.port.js';
import { ITokenService } from '../../../src/domain/ports/token-service.port.js';

describe('LoginUseCase (Unit)', () => {
  let useCase: LoginUseCase;
  let mockUserRepo: IUserRepository;
  let mockHasher: IPasswordHasher;
  let mockTokenService: ITokenService;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      findCourierByUserId: vi.fn(),
      saveCustomer: vi.fn(),
      saveCourier: vi.fn(),
    };

    mockHasher = {
      hash: vi.fn(),
      verify: vi.fn(),
    };

    mockTokenService = {
      generateTokens: vi.fn().mockResolvedValue({
        accessToken: 'access_123',
        refreshToken: 'refresh_123',
      }),
      verifyAccessToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
    };

    useCase = new LoginUseCase(mockUserRepo, mockHasher, mockTokenService);
  });

  it('should authenticate user and return tokens on valid credentials', async () => {
    const user = new User({
      id: 'usr_123',
      email: 'user@dashroute.com',
      passwordHash: 'valid_hash',
      fullName: 'Valid User',
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);
    vi.mocked(mockHasher.verify).mockResolvedValue(true);

    const result = await useCase.execute({
      email: 'user@dashroute.com',
      password: 'CorrectPassword!',
    });

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('user@dashroute.com');
    expect(mockHasher.verify).toHaveBeenCalledWith('valid_hash', 'CorrectPassword!');
    expect(result.accessToken).toBe('access_123');
    expect(result.user.id).toBe('usr_123');
  });

  it('should throw InvalidCredentialsException when user not found', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'notfound@dashroute.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw InvalidCredentialsException when password does not match', async () => {
    const user = new User({
      id: 'usr_123',
      email: 'user@dashroute.com',
      passwordHash: 'valid_hash',
      fullName: 'Valid User',
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);
    vi.mocked(mockHasher.verify).mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: 'user@dashroute.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(InvalidCredentialsException);
  });
});
