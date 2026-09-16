import { Injectable, Logger, Inject } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import crypto from 'node:crypto';

@Injectable()
export class RabbitMQPublisherService {
  private readonly logger = new Logger(RabbitMQPublisherService.name);
  private readonly exchange = 'dashroute.events';

  constructor(@Inject(AmqpConnection) private readonly amqpConnection: AmqpConnection) {}

  publish(routingKey: string, message: unknown) {
    const envelope = {
      event_id: crypto.randomUUID(),
      event_type: routingKey,
      occurred_at: new Date().toISOString(),
      version: '1.0',
      producer: 'orders-service',
      payload: message,
    };
    this.amqpConnection.publish(this.exchange, routingKey, envelope);
    this.logger.debug(`Published event envelope for ${routingKey}`);
  }
}
