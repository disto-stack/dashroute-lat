import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RefreshTokenUseCase } from '../../../src/application/use-cases/refresh-token.use-case.js';
import { UserNotFoundException, InvalidTokenException } from '../../../src/domain/exceptions/domain.exceptions.js';
import { User } from '../../../src/domain/entities/user.entity.js';
import { IUserRepository } from '../../../src/domain/ports/user-repository.port.js';
import { ITokenService } from '../../../src/domain/ports/token-service.port.js';

describe('RefreshTokenUseCase (Unit)', () => {
  let useCase: RefreshTokenUseCase;
  let mockUserRepo: IUserRepository;
  let mockTokenService: ITokenService;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      findCourierByUserId: vi.fn(),
      saveCustomer: vi.fn(),
      saveCourier: vi.fn(),
    };

    mockTokenService = {
      generateTokens: vi.fn().mockResolvedValue({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      }),
      verifyAccessToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
    };

    useCase = new RefreshTokenUseCase(mockUserRepo, mockTokenService);
  });

  it('should issue new tokens when refresh token is valid and user exists', async () => {
    vi.mocked(mockTokenService.verifyRefreshToken).mockResolvedValue({
      userId: 'usr_valid',
      email: 'user@dashroute.com',
      role: 'CUSTOMER',
    });

    const user = new User({
      id: 'usr_valid',
      email: 'user@dashroute.com',
      passwordHash: 'hash',
      fullName: 'Valid User',
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(mockUserRepo.findById).mockResolvedValue(user);

    const result = await useCase.execute({ refreshToken: 'valid_refresh_token' });

    expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith('valid_refresh_token');
    expect(mockUserRepo.findById).toHaveBeenCalledWith('usr_valid');
    expect(result.accessToken).toBe('new_access_token');
  });

  it('should throw InvalidTokenException when refresh token verification fails', async () => {
    vi.mocked(mockTokenService.verifyRefreshToken).mockRejectedValue(new InvalidTokenException());

    await expect(
      useCase.execute({ refreshToken: 'expired_refresh_token' }),
    ).rejects.toThrow(InvalidTokenException);
  });

  it('should throw UserNotFoundException if user has been deleted', async () => {
    vi.mocked(mockTokenService.verifyRefreshToken).mockResolvedValue({
      userId: 'usr_deleted',
      email: 'deleted@dashroute.com',
      role: 'CUSTOMER',
    });

    vi.mocked(mockUserRepo.findById).mockResolvedValue(null);

    await expect(
      useCase.execute({ refreshToken: 'valid_refresh_token' }),
    ).rejects.toThrow(UserNotFoundException);
  });
});
