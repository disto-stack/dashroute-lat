import { Injectable, Inject, Logger } from '@nestjs/common';
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
import { TOKEN_SERVICE_PORT, type ITokenService } from '../../domain/ports/token-service.port.js';
import { type RegisterCourierDto } from '../dto/register-courier.dto.js';

@Injectable()
export class RegisterCourierUseCase {
  private readonly logger = new Logger(RegisterCourierUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly userRepo: IUserRepository,
    @Inject(PASSWORD_HASHER_PORT) private readonly hasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE_PORT) private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: RegisterCourierDto) {
    const formattedEmail = dto.email.toLowerCase().trim();
    const existing = await this.userRepo.findByEmail(formattedEmail);
    if (existing) {
      this.logger.warn(`Courier registration failed: User already exists with email ${formattedEmail}`);
      throw new UserAlreadyExistsException(dto.email);
    }

    const passwordHash = await this.hasher.hash(dto.password);
    const userId = `usr_${crypto.randomBytes(12).toString('hex')}`;
    const now = new Date();

    const user = new User({
      id: userId,
      email: formattedEmail,
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

    this.logger.log(`New COURIER user registered successfully: ${result.user.id} with courierId ${result.courier.id}`);

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

