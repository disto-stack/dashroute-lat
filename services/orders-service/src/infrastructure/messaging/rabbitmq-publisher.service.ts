import { Injectable, Logger, Inject } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitMQPublisherService {
  private readonly logger = new Logger(RabbitMQPublisherService.name);
  private readonly exchange = 'dashroute.events';

  constructor(@Inject(AmqpConnection) private readonly amqpConnection: AmqpConnection) {}

  publish(routingKey: string, message: unknown) {
    this.amqpConnection.publish(this.exchange, routingKey, message);
    this.logger.debug(`Published message to ${routingKey}`);
  }
}
