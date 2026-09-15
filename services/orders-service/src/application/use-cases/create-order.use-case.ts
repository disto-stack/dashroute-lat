import { Injectable, Inject } from '@nestjs/common';
import { type CreateOrderDto } from '../dto/create-order.dto.js';
import { RabbitMQPublisherService } from '../../infrastructure/messaging/rabbitmq-publisher.service.js';
import { ORDER_REPOSITORY_PORT, type IOrderRepository } from '../../domain/ports/order-repository.port.js';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT) private readonly orderRepository: IOrderRepository,
    @Inject(RabbitMQPublisherService) private readonly publisher: RabbitMQPublisherService
  ) {}

  async execute(dto: CreateOrderDto, customerId: string) {
    const newOrder = await this.orderRepository.create({
      customerId,
      status: 'PENDING',
      pickupLocation: dto.pickupLocation,
      dropoffLocation: dto.dropoffLocation,
    });

    this.publisher.publish('order.created', newOrder);

    return newOrder;
  }
}
