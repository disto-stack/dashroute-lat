import { Module, Global } from '@nestjs/common';
import { RabbitMQModule as GoLevelUpRabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQPublisherService } from './rabbitmq-publisher.service.js';
import { RabbitMQConsumerService } from './rabbitmq-consumer.service.js';

@Global()
@Module({
  imports: [
    GoLevelUpRabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'dashroute.events',
          type: 'topic',
        },
      ],
      uri: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [RabbitMQPublisherService, RabbitMQConsumerService],
  exports: [GoLevelUpRabbitMQModule, RabbitMQPublisherService],
})
export class RabbitMQModule {}
