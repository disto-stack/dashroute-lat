import { Injectable, Inject } from '@nestjs/common';
import crypto from 'node:crypto';
import { User } from '../../domain/entities/user.entity.js';
import { UserAlreadyExistsException } from '../../domain/exceptions/domain.exceptions.js';
import {
  USER_REPOSITORY_PORT,
  type IUserRepository,
} from '../../domain/ports/user-repository.port.js';
import {
  PASSWORD_HASHER_PORT,
  type IPasswordHasher,
} from '../../domain/ports/password-hasher.port.js';
import {
  TOKEN_SERVICE_PORT,
  type ITokenService,
} from '../../domain/ports/token-service.port.js';
import { RegisterCourierDto } from '../dto/register-courier.dto.js';

@Injectable()
export class RegisterCourierUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly userRepo: IUserRepository,
    @Inject(PASSWORD_HASHER_PORT) private readonly hasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE_PORT) private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: RegisterCourierDto) {
    const existing = await this.userRepo.findByEmail(dto.email.toLowerCase().trim());
    if (existing) {
      throw new UserAlreadyExistsException(dto.email);
    }

    const passwordHash = await this.hasher.hash(dto.password);
    const userId = `usr_${crypto.randomBytes(12).toString('hex')}`;
    const now = new Date();

    const user = new User({
      id: userId,
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      fullName: dto.fullName.trim(),
      role: 'COURIER',
      createdAt: now,
      updatedAt: now,
    });

    const result = await this.userRepo.saveCourier(user, {
      userId: user.id,
      vehicleType: dto.vehicleType,
      plateNumber: dto.plateNumber || null,
    });

    const tokens = await this.tokenService.generateTokens({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      courierId: result.courier.id,
    });

    return {
      ...tokens,
      user: {
        ...result.user.toJSON(),
        courierProfile: result.courier.toJSON(),
      },
    };
  }
}
