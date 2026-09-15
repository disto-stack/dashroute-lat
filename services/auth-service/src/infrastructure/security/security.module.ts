import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PASSWORD_HASHER_PORT } from '../../domain/ports/password-hasher.port.js';
import { TOKEN_SERVICE_PORT } from '../../domain/ports/token-service.port.js';
import { Argon2PasswordHasher } from './argon2-password-hasher.js';
import { JwtTokenService } from './jwt-token.service.js';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'dashroute-default-jwt-secret-replace-in-prod',
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [
    {
      provide: PASSWORD_HASHER_PORT,
      useClass: Argon2PasswordHasher,
    },
    {
      provide: TOKEN_SERVICE_PORT,
      useClass: JwtTokenService,
    },
  ],
  exports: [PASSWORD_HASHER_PORT, TOKEN_SERVICE_PORT, JwtModule],
})
export class SecurityModule {}
