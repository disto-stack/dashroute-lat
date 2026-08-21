import { Injectable, Inject } from '@nestjs/common';
import { InvalidCredentialsException } from '../../domain/exceptions/domain.exceptions.js';
import {
  USER_REPOSITORY_PORT,
  type IUserRepository,
} from '../../domain/ports/user-repository.port.js';
import {
  PASSWORD_HASHER_PORT,
  type IPasswordHasher,
} from '../../domain/ports/password-hasher.port.js';
import { TOKEN_SERVICE_PORT, type ITokenService } from '../../domain/ports/token-service.port.js';
import { type LoginDto } from '../dto/login.dto.js';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly userRepo: IUserRepository,
    @Inject(PASSWORD_HASHER_PORT) private readonly hasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE_PORT) private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: LoginDto) {
    const user = await this.userRepo.findByEmail(dto.email.toLowerCase().trim());
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isValid = await this.hasher.verify(user.passwordHash, dto.password);
    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    let courierId: string | undefined;
    if (user.role === 'COURIER') {
      const courier = await this.userRepo.findCourierByUserId(user.id);
      courierId = courier?.id;
    }

    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      courierId,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        courierId,
      },
    };
  }
}
