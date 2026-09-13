import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ORDER_REPOSITORY_PORT, type IOrderRepository } from '../../domain/ports/order-repository.port.js';
import { type AuthenticatedUser } from '../../infrastructure/http/guards/jwt-auth.guard.js';
import { type CaslAbilityFactory } from '../../infrastructure/casl/casl-ability.factory.js';

@Injectable()
export class GetOrderByIdUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT) private readonly orderRepository: IOrderRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async execute(orderId: string, user: AuthenticatedUser) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can('read', order)) {
      throw new ForbiddenException('You do not have permission to read this order');
    }

    return order;
  }
}
