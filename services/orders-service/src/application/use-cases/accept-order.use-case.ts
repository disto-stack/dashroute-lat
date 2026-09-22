import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  ORDER_REPOSITORY_PORT,
  type IOrderRepository,
} from '../../domain/ports/order-repository.port.js';
import { InvalidStateTransitionException } from '../../domain/exceptions/invalid-state-transition.exception.js';
import { type Order } from '../../domain/entities/order.entity.js';

@Injectable()
export class AcceptOrderUseCase {
  private readonly logger = new Logger(AcceptOrderUseCase.name);

  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(orderId: string, courierId: string): Promise<Order> {
    this.logger.log(`Courier ${courierId} attempting to accept order ${orderId}`);

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      this.logger.warn(`Order ${orderId} not found`);
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.courierId !== courierId) {
      this.logger.warn(
        `Courier ${courierId} is not authorized to accept order ${orderId} (assigned to ${order.courierId})`,
      );
      throw new ForbiddenException(`You are not assigned to order ${orderId}`);
    }

    try {
      order.acceptOrder();
    } catch (error) {
      if (error instanceof InvalidStateTransitionException) {
        this.logger.warn(`Invalid state transition for order ${orderId}: ${error.message}`);
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const updatedOrder = await this.orderRepository.updateStatus(
      order.id,
      order.status,
      order.courierId ?? undefined,
    );
    this.logger.log(`Order ${orderId} accepted by courier ${courierId}`);

    return updatedOrder;
  }
}
