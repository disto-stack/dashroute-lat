import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  type ITokenService,
  type TokenPayload,
  type GeneratedTokens,
} from '../../domain/ports/token-service.port.js';
import { InvalidTokenException } from '../../domain/exceptions/domain.exceptions.js';

interface RawJwtPayload {
  sub: string;
  email: string;
  role: any;
  courierId?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtTokenService implements ITokenService {
  private readonly jwtSecret: string;
  private readonly refreshSecret: string;

  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {
    this.jwtSecret = process.env.JWT_SECRET || 'dashroute-default-jwt-secret-replace-in-prod';
    this.refreshSecret =
      process.env.JWT_REFRESH_SECRET || 'dashroute-default-refresh-secret-replace-in-prod';
  }

  async generateTokens(payload: TokenPayload): Promise<GeneratedTokens> {
    const rawPayload: RawJwtPayload = {
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
      courierId: payload.courierId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(rawPayload, {
        secret: this.jwtSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(rawPayload, {
        secret: this.refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RawJwtPayload>(token, {
        secret: this.jwtSecret,
      });

      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        courierId: payload.courierId,
      };
    } catch {
      throw new InvalidTokenException('Invalid or expired access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RawJwtPayload>(token, {
        secret: this.refreshSecret,
      });

      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        courierId: payload.courierId,
      };
    } catch {
      throw new InvalidTokenException('Invalid or expired refresh token');
    }
  }
}
