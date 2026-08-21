import { Test, type TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthController } from '../../../src/infrastructure/http/controllers/auth.controller.js';
import { RegisterCustomerUseCase } from '../../../src/application/use-cases/register-customer.use-case.js';
import { RegisterCourierUseCase } from '../../../src/application/use-cases/register-courier.use-case.js';
import { LoginUseCase } from '../../../src/application/use-cases/login.use-case.js';
import { RefreshTokenUseCase } from '../../../src/application/use-cases/refresh-token.use-case.js';
import { GetProfileUseCase } from '../../../src/application/use-cases/get-profile.use-case.js';
import { VerifyCourierUseCase } from '../../../src/application/use-cases/verify-courier.use-case.js';
import { JwtAuthGuard } from '../../../src/infrastructure/http/guards/jwt-auth.guard.js';
import { PoliciesGuard } from '../../../src/infrastructure/casl/policies.guard.js';

describe('AuthController', () => {
  let controller: AuthController;

  const mockRegisterCustomerUseCase = { execute: vi.fn() };
  const mockRegisterCourierUseCase = { execute: vi.fn() };
  const mockLoginUseCase = { execute: vi.fn() };
  const mockRefreshTokenUseCase = { execute: vi.fn() };
  const mockGetProfileUseCase = { execute: vi.fn() };
  const mockVerifyCourierUseCase = { execute: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterCustomerUseCase, useValue: mockRegisterCustomerUseCase },
        { provide: RegisterCourierUseCase, useValue: mockRegisterCourierUseCase },
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: RefreshTokenUseCase, useValue: mockRefreshTokenUseCase },
        { provide: GetProfileUseCase, useValue: mockGetProfileUseCase },
        { provide: VerifyCourierUseCase, useValue: mockVerifyCourierUseCase },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call LoginUseCase with correct arguments', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      mockLoginUseCase.execute.mockResolvedValue({ token: 'abc' });

      const result = await controller.login(loginDto);

      expect(mockLoginUseCase.execute).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({ token: 'abc' });
    });
  });

  describe('verifyCourier', () => {
    it('should call VerifyCourierUseCase with correct arguments', async () => {
      const verifyDto = { isVerified: true, rejectionReason: null };
      mockVerifyCourierUseCase.execute.mockResolvedValue({ success: true });

      const result = await controller.verifyCourier('courier-123', verifyDto);

      expect(mockVerifyCourierUseCase.execute).toHaveBeenCalledWith('courier-123', verifyDto);
      expect(result).toEqual({ success: true });
    });
  });
});
