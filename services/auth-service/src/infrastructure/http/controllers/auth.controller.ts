import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseFilters,
  Inject,
} from '@nestjs/common';
import { RegisterCustomerUseCase } from '../../../application/use-cases/register-customer.use-case.js';
import { RegisterCourierUseCase } from '../../../application/use-cases/register-courier.use-case.js';
import { LoginUseCase } from '../../../application/use-cases/login.use-case.js';
import { RefreshTokenUseCase } from '../../../application/use-cases/refresh-token.use-case.js';
import { GetProfileUseCase } from '../../../application/use-cases/get-profile.use-case.js';
import { VerifyCourierUseCase } from '../../../application/use-cases/verify-courier.use-case.js';
import {
  type RegisterCustomerDto,
  registerCustomerSchema,
} from '../../../application/dto/register-customer.dto.js';
import {
  type RegisterCourierDto,
  registerCourierSchema,
} from '../../../application/dto/register-courier.dto.js';
import { type LoginDto, loginSchema } from '../../../application/dto/login.dto.js';
import {
  type RefreshTokenDto,
  refreshTokenSchema,
} from '../../../application/dto/refresh-token.dto.js';
import {
  type VerifyCourierDto,
  verifyCourierSchema,
} from '../../../application/dto/verify-courier.dto.js';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe.js';
import { JwtAuthGuard, type AuthenticatedUser } from '../guards/jwt-auth.guard.js';
import { PoliciesGuard } from '../../casl/policies.guard.js';
import { CheckPolicies } from '../../casl/check-policies.decorator.js';
import { type AppAbility } from '../../casl/casl-ability.factory.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { DomainExceptionFilter } from '../filters/domain-exception.filter.js';

@Controller('auth')
@UseFilters(DomainExceptionFilter)
export class AuthController {
  constructor(
    @Inject(RegisterCustomerUseCase)
    private readonly registerCustomerUseCase: RegisterCustomerUseCase,
    @Inject(RegisterCourierUseCase)
    private readonly registerCourierUseCase: RegisterCourierUseCase,
    @Inject(LoginUseCase)
    private readonly loginUseCase: LoginUseCase,
    @Inject(RefreshTokenUseCase)
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @Inject(GetProfileUseCase)
    private readonly getProfileUseCase: GetProfileUseCase,
    @Inject(VerifyCourierUseCase)
    private readonly verifyCourierUseCase: VerifyCourierUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(new ZodValidationPipe(registerCustomerSchema)) dto: RegisterCustomerDto) {
    return this.registerCustomerUseCase.execute(dto);
  }

  @Post('register/courier')
  @HttpCode(HttpStatus.CREATED)
  async registerCourier(
    @Body(new ZodValidationPipe(registerCourierSchema)) dto: RegisterCourierDto,
  ) {
    return this.registerCourierUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body(new ZodValidationPipe(refreshTokenSchema)) dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.getProfileUseCase.execute(user.id);
  }

  @Patch('couriers/:id/verify')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can('manage', 'all'))
  @HttpCode(HttpStatus.OK)
  async verifyCourier(
    @Param('id') courierId: string,
    @Body(new ZodValidationPipe(verifyCourierSchema)) dto: VerifyCourierDto,
  ) {
    return this.verifyCourierUseCase.execute(courierId, dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: 'Successfully logged out' };
  }
}
