import { Injectable, Inject, Logger } from '@nestjs/common';
import { type CreateOrderDto } from '../dto/create-order.dto.js';
import { RabbitMQPublisherService } from '../../infrastructure/messaging/rabbitmq-publisher.service.js';
import {
  ORDER_REPOSITORY_PORT,
  type IOrderRepository,
} from '../../domain/ports/order-repository.port.js';

@Injectable()
export class CreateOrderUseCase {
  private readonly logger = new Logger(CreateOrderUseCase.name);

  constructor(
    @Inject(ORDER_REPOSITORY_PORT) private readonly orderRepository: IOrderRepository,
    @Inject(RabbitMQPublisherService) private readonly publisher: RabbitMQPublisherService,
  ) {}

  async execute(dto: CreateOrderDto, customerId: string) {
    const newOrder = await this.orderRepository.create({
      customerId,
      status: 'PENDING',
      pickupLocation: dto.pickupLocation,
      dropoffLocation: dto.dropoffLocation,
    });

    this.logger.log(`Order ${newOrder.id} successfully created for customer ${customerId}`);

    try {
      const eventPayload = {
        orderId: newOrder.id,
        customerId: newOrder.customerId,
        pickupLon: newOrder.pickupLocation.lng,
        pickupLat: newOrder.pickupLocation.lat,
        deliveryLon: newOrder.dropoffLocation.lng,
        deliveryLat: newOrder.dropoffLocation.lat,
      };
      this.publisher.publish('order.created', eventPayload);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to publish 'order.created' event for order ${newOrder.id}`,
        err.stack,
      );
      throw error;
    }

    return newOrder;
  }
}
