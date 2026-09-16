import { Injectable, Inject } from '@nestjs/common';
import {
  ORDER_REPOSITORY_PORT,
  type IOrderRepository,
  type OrderSearchCriteria,
} from '../../domain/ports/order-repository.port.js';
import { type GetOrdersQueryDto } from '../dto/get-orders-query.dto.js';
import { type AuthenticatedUser } from '../../infrastructure/http/guards/jwt-auth.guard.js';

@Injectable()
export class GetOrdersUseCase {
  constructor(@Inject(ORDER_REPOSITORY_PORT) private readonly orderRepository: IOrderRepository) {}

  async execute(query: GetOrdersQueryDto, user: AuthenticatedUser) {
    const criteria: OrderSearchCriteria = {
      status: query.status,
    };

    if (user.role === 'CUSTOMER') {
      criteria.customerId = user.id;
    } else if (user.role === 'COURIER') {
      criteria.courierId = user.id;
    } else if (user.role === 'ADMIN') {
      criteria.customerId = query.customerId;
      criteria.courierId = query.courierId;
    }

    return this.orderRepository.search(criteria, {
      limit: query.limit ?? 10,
      cursor: query.cursor,
    });
  }
}
