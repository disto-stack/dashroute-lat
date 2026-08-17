import { Injectable, Inject } from '@nestjs/common';
import {
  type IUserRepository,
  USER_REPOSITORY_PORT,
} from '../../domain/ports/user-repository.port.js';
import { CourierNotFoundException } from '../../domain/exceptions/domain.exceptions.js';
import { type VerifyCourierDto } from '../dto/verify-courier.dto.js';
import { type Courier } from '../../domain/entities/courier.entity.js';

@Injectable()
export class VerifyCourierUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(courierId: string, dto: VerifyCourierDto): Promise<Courier> {
    const courier = await this.userRepo.findCourierById(courierId);
    if (!courier) {
      throw new CourierNotFoundException(courierId);
    }

    const updatedCourier = await this.userRepo.updateCourierVerification(courierId, dto.isVerified);
    if (!updatedCourier) {
      throw new CourierNotFoundException(courierId);
    }

    return updatedCourier;
  }
}
