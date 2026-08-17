import { UserRole } from '../entities/user.entity.js';

export const TOKEN_SERVICE_PORT = Symbol('TOKEN_SERVICE_PORT');

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  courierId?: string;
}

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenService {
  generateTokens(payload: TokenPayload): Promise<GeneratedTokens>;
  verifyAccessToken(token: string): Promise<TokenPayload>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}
