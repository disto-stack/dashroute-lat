import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerifyCourierUseCase } from '../../../src/application/use-cases/verify-courier.use-case.js';
import { CourierNotFoundException } from '../../../src/domain/exceptions/domain.exceptions.js';
import { Courier } from '../../../src/domain/entities/courier.entity.js';
import { type IUserRepository } from '../../../src/domain/ports/user-repository.port.js';

describe('VerifyCourierUseCase (Unit)', () => {
  let useCase: VerifyCourierUseCase;
  let mockUserRepo: IUserRepository;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      findCourierById: vi.fn(),
      findCourierByUserId: vi.fn(),
      saveCustomer: vi.fn(),
      saveCourier: vi.fn(),
      updateCourierVerification: vi.fn(),
    };

    useCase = new VerifyCourierUseCase(mockUserRepo);
  });

  it('should successfully verify a courier', async () => {
    const courier = new Courier({
      id: 'cur_123',
      userId: 'usr_123',
      vehicleType: 'MOTORCYCLE',
      plateNumber: 'MOT-123',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const verifiedCourier = new Courier({
      ...courier,
      isVerified: true,
      updatedAt: new Date(),
    });

    vi.mocked(mockUserRepo.findCourierById).mockResolvedValue(courier);
    vi.mocked(mockUserRepo.updateCourierVerification).mockResolvedValue(verifiedCourier);

    const result = await useCase.execute('cur_123', { isVerified: true });

    expect(mockUserRepo.findCourierById).toHaveBeenCalledWith('cur_123');
    expect(mockUserRepo.updateCourierVerification).toHaveBeenCalledWith('cur_123', true);
    expect(result.isVerified).toBe(true);
  });

  it('should throw CourierNotFoundException when courier is not found', async () => {
    vi.mocked(mockUserRepo.findCourierById).mockResolvedValue(null);

    await expect(useCase.execute('cur_nonexistent', { isVerified: true })).rejects.toThrow(
      CourierNotFoundException,
    );

    expect(mockUserRepo.updateCourierVerification).not.toHaveBeenCalled();
  });
});
