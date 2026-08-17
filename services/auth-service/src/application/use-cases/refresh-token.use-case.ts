import { Injectable, Inject } from '@nestjs/common';
import { UserNotFoundException } from '../../domain/exceptions/domain.exceptions.js';
import {
  USER_REPOSITORY_PORT,
  type IUserRepository,
} from '../../domain/ports/user-repository.port.js';
import {
  TOKEN_SERVICE_PORT,
  type ITokenService,
} from '../../domain/ports/token-service.port.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly userRepo: IUserRepository,
    @Inject(TOKEN_SERVICE_PORT) private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: RefreshTokenDto) {
    const payload = await this.tokenService.verifyRefreshToken(dto.refreshToken);

    const user = await this.userRepo.findById(payload.userId);
    if (!user) {
      throw new UserNotFoundException(payload.userId);
    }

    return this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      courierId: payload.courierId,
    });
  }
}
