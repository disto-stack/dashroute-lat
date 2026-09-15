import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { type Request } from 'express';

import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  courierId?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(ConfigService) private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token missing');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'fallback-secret-for-dev';
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
            const user: AuthenticatedUser = {
        id: decoded.sub || decoded.userId,
        email: decoded.email,
        role: decoded.role,
        courierId: decoded.courierId,
      };

      (request as any).user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
