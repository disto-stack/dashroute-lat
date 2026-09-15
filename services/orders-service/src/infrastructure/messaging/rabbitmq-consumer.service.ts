import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ProcessOrderAssignedUseCase } from '../../application/use-cases/process-order-assigned.use-case.js';
import { deliveryAssignedEventSchema } from '../../application/dto/delivery-assigned-event.dto.js';

@Injectable()
export class RabbitMQConsumerService {
  private readonly logger = new Logger(RabbitMQConsumerService.name);

  constructor(
    private readonly processOrderAssignedUseCase: ProcessOrderAssignedUseCase,
  ) {}

  @RabbitSubscribe({
    exchange: 'dashroute.events',
    routingKey: 'delivery.assigned',
    queue: 'orders_service_assigned_queue',
  })
  public async handleDeliveryAssigned(msg: any) {
    this.logger.log('Received delivery.assigned event');
    try {
      const parsedMsg = deliveryAssignedEventSchema.parse(msg);
      await this.processOrderAssignedUseCase.execute(parsedMsg);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to process delivery.assigned event: ${err.message}`, err.stack);
      // NOTE: With golevelup, we can return a Nack to put it in a DLQ if needed.
      // For now, we just catch and log to avoid endless loops.
    }

  }
}
