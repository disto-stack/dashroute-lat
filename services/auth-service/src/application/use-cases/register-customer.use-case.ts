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
import { TOKEN_SERVICE_PORT, type ITokenService } from '../../domain/ports/token-service.port.js';
import { type RegisterCustomerDto } from '../dto/register-customer.dto.js';

@Injectable()
export class RegisterCustomerUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly userRepo: IUserRepository,
    @Inject(PASSWORD_HASHER_PORT) private readonly hasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE_PORT) private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: RegisterCustomerDto) {
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
      role: 'CUSTOMER',
      createdAt: now,
      updatedAt: now,
    });

    const savedUser = await this.userRepo.saveCustomer(user);

    const tokens = await this.tokenService.generateTokens({
      userId: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    });

    return {
      ...tokens,
      user: savedUser.toJSON(),
    };
  }
}
