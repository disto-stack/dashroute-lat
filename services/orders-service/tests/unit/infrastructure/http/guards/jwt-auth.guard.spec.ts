import { describe, it, expect } from 'vitest';
import { JwtAuthGuard } from '../../../../../src/infrastructure/http/guards/jwt-auth.guard.js';
import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

describe('JwtAuthGuard', () => {
  const mockConfigService = {
    get: (key: string) => (key === 'JWT_SECRET' ? 'fallback-secret-for-dev' : null),
  };
  const guard = new JwtAuthGuard(mockConfigService as any);
  const secret = 'fallback-secret-for-dev';

  const createMockContext = (authHeader?: string) => {
    const request: any = {
      headers: authHeader ? { authorization: authHeader } : {},
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      request,
    };
  };

  it('should authenticate valid JWT token and attach user to request', async () => {
    const payload = { userId: 'user-123', email: 'test@dashroute.com', role: 'CUSTOMER' };
    const token = jwt.sign(payload, secret);
    const { switchToHttp, request } = createMockContext(`Bearer ${token}`);

    const result = await guard.canActivate({ switchToHttp } as ExecutionContext);

    expect(result).toBe(true);
    expect(request.user).toEqual({
      id: 'user-123',
      email: 'test@dashroute.com',
      role: 'CUSTOMER',
      courierId: undefined,
    });
  });

  it('should throw UnauthorizedException when Authorization header is missing', async () => {
    const { switchToHttp } = createMockContext();

    await expect(guard.canActivate({ switchToHttp } as ExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when JWT signature is invalid', async () => {
    const token = jwt.sign({ userId: 'user-123' }, 'wrong-secret');
    const { switchToHttp } = createMockContext(`Bearer ${token}`);

    await expect(guard.canActivate({ switchToHttp } as ExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
