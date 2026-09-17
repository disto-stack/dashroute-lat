import { Inject, Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ProcessOrderAssignedUseCase } from '../../application/use-cases/process-order-assigned.use-case.js';
import { ProcessOrderDispatchFailedUseCase } from '../../application/use-cases/process-order-dispatch-failed.use-case.js';
import { deliveryAssignedEventSchema } from '../../application/dto/delivery-assigned-event.dto.js';
import { orderDispatchFailedEventSchema } from '../../application/dto/order-dispatch-failed-event.dto.js';

@Injectable()
export class RabbitMQConsumerService {
  private readonly logger = new Logger(RabbitMQConsumerService.name);

  constructor(
    @Inject(ProcessOrderAssignedUseCase)
    private readonly processOrderAssignedUseCase: ProcessOrderAssignedUseCase,
    @Inject(ProcessOrderDispatchFailedUseCase)
    private readonly processOrderDispatchFailedUseCase: ProcessOrderDispatchFailedUseCase,
  ) {}

  @RabbitSubscribe({
    exchange: 'dashroute.events',
    routingKey: 'delivery.assigned',
    queue: 'orders.assigned.q',
  })
  public async handleDeliveryAssigned(msg: any) {
    this.logger.log('Received delivery.assigned event');
    try {
      const payload = msg.payload ?? msg;
      const parsedMsg = deliveryAssignedEventSchema.parse(payload);
      await this.processOrderAssignedUseCase.execute(parsedMsg);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to process delivery.assigned event: ${err.message}`, err.stack);
    }
  }

  @RabbitSubscribe({
    exchange: 'dashroute.events',
    routingKey: 'order.dispatch_failed',
    queue: 'orders.dispatch_failed.q',
  })
  public async handleOrderDispatchFailed(msg: any) {
    this.logger.log('Received order.dispatch_failed event');
    try {
      const payload = msg.payload ?? msg;
      const parsedMsg = orderDispatchFailedEventSchema.parse(payload);
      await this.processOrderDispatchFailedUseCase.execute(parsedMsg);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to process order.dispatch_failed event: ${err.message}`, err.stack);
    }
  }
}
