import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import {
  ORDER_REPOSITORY_PORT,
  type IOrderRepository,
} from '../../domain/ports/order-repository.port.js';
import { type OrderDispatchFailedEventDto } from '../dto/order-dispatch-failed-event.dto.js';
import { InvalidStateTransitionException } from '../../domain/exceptions/invalid-state-transition.exception.js';

@Injectable()
export class ProcessOrderDispatchFailedUseCase {
  private readonly logger = new Logger(ProcessOrderDispatchFailedUseCase.name);

  constructor(@Inject(ORDER_REPOSITORY_PORT) private readonly orderRepository: IOrderRepository) {}

  async execute(event: OrderDispatchFailedEventDto) {
    this.logger.log(
      `Processing order.dispatch_failed event for order ${event.orderId}. Reason: ${event.reason}`,
    );

    const order = await this.orderRepository.findById(event.orderId);
    if (!order) {
      this.logger.warn(`Order ${event.orderId} not found. Cannot cancel.`);
      throw new NotFoundException(`Order ${event.orderId} not found`);
    }

    try {
      order.cancel();
    } catch (error) {
      if (error instanceof InvalidStateTransitionException) {
        this.logger.warn(`Invalid state transition for order ${event.orderId}: ${error.message}`);
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const updatedOrder = await this.orderRepository.updateStatus(
      order.id,
      order.status,
      order.courierId ?? undefined,
    );
    this.logger.log(`Order ${event.orderId} successfully updated to CANCELLED`);

    return updatedOrder;
  }
}
