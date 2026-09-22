import { CreateOrderUseCase } from '../../../application/use-cases/create-order.use-case.js';
import { GetOrdersUseCase } from '../../../application/use-cases/get-orders.use-case.js';
import { GetOrderByIdUseCase } from '../../../application/use-cases/get-order-by-id.use-case.js';
import { AcceptOrderUseCase } from '../../../application/use-cases/accept-order.use-case.js';
import {
  createOrderSchema,
  type CreateOrderDto,
} from '../../../application/dto/create-order.dto.js';
import {
  getOrdersQuerySchema,
  type GetOrdersQueryDto,
} from '../../../application/dto/get-orders-query.dto.js';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe.js';
import { JwtAuthGuard, type AuthenticatedUser } from '../guards/jwt-auth.guard.js';
import { PoliciesGuard } from '../../casl/policies.guard.js';
import { CheckPolicies } from '../../casl/check-policies.decorator.js';
import { type AppAbility } from '../../casl/casl-ability.factory.js';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  UsePipes,
  Req,
  Get,
  Patch,
  Param,
  Query,
  Inject,
} from '@nestjs/common';

@Controller('orders')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class OrdersController {
  constructor(
    @Inject(CreateOrderUseCase)
    private readonly createOrderUseCase: CreateOrderUseCase,
    @Inject(GetOrdersUseCase)
    private readonly getOrdersUseCase: GetOrdersUseCase,
    @Inject(GetOrderByIdUseCase)
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
    @Inject(AcceptOrderUseCase)
    private readonly acceptOrderUseCase: AcceptOrderUseCase,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createOrderSchema))
  @CheckPolicies((ability: AppAbility) => ability.can('create', 'Order'))
  async createOrder(@Body() dto: CreateOrderDto, @Req() req: { user: AuthenticatedUser }) {
    return this.createOrderUseCase.execute(dto, req.user.id);
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'Order'))
  async getOrders(
    @Query(new ZodValidationPipe(getOrdersQuerySchema)) query: GetOrdersQueryDto,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.getOrdersUseCase.execute(query, req.user);
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'Order'))
  async getOrderById(@Param('id') id: string, @Req() req: { user: AuthenticatedUser }) {
    return this.getOrderByIdUseCase.execute(id, req.user);
  }

  @Patch(':id/accept')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'Order'))
  async acceptOrder(@Param('id') id: string, @Req() req: { user: AuthenticatedUser }) {
    return this.acceptOrderUseCase.execute(id, req.user.id);
  }
}
