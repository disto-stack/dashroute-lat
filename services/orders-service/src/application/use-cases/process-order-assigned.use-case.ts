import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ORDER_REPOSITORY_PORT, type IOrderRepository } from '../../domain/ports/order-repository.port.js';
import { type DeliveryAssignedEventDto } from '../dto/delivery-assigned-event.dto.js';

import { InvalidStateTransitionException } from '../../domain/exceptions/invalid-state-transition.exception.js';

@Injectable()
export class ProcessOrderAssignedUseCase {
  private readonly logger = new Logger(ProcessOrderAssignedUseCase.name);

  constructor(
    @Inject(ORDER_REPOSITORY_PORT) private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(event: DeliveryAssignedEventDto) {
    this.logger.log(`Processing delivery.assigned event for order ${event.orderId} to courier ${event.courierId}`);
    
    const order = await this.orderRepository.findById(event.orderId);
    if (!order) {
      this.logger.warn(`Order ${event.orderId} not found. Cannot assign courier.`);
      throw new NotFoundException(`Order ${event.orderId} not found`);
    }

    try {
      order.assignCourier(event.courierId);
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
    this.logger.log(`Order ${event.orderId} successfully updated to ASSIGNED`);
    
    return updatedOrder;
  }
}
