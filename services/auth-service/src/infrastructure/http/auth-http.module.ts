import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller.js';
import { HealthController } from './controllers/health.controller.js';
import { RegisterCustomerUseCase } from '../../application/use-cases/register-customer.use-case.js';
import { RegisterCourierUseCase } from '../../application/use-cases/register-courier.use-case.js';
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case.js';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case.js';
import { VerifyCourierUseCase } from '../../application/use-cases/verify-courier.use-case.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
  controllers: [AuthController, HealthController],
  providers: [
    RegisterCustomerUseCase,
    RegisterCourierUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    GetProfileUseCase,
    VerifyCourierUseCase,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    RegisterCustomerUseCase,
    RegisterCourierUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    GetProfileUseCase,
    VerifyCourierUseCase,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthHttpModule {}
