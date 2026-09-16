import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule as GoLevelUpRabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQPublisherService } from './rabbitmq-publisher.service.js';
import { RabbitMQConsumerService } from './rabbitmq-consumer.service.js';

@Global()
@Module({
  imports: [
    GoLevelUpRabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const user = config.get<string>('RABBITMQ_USER', 'guest');
        const pass = encodeURIComponent(config.get<string>('RABBITMQ_PASS', 'guest'));
        const host = config.get<string>('RABBITMQ_HOST', 'localhost');
        const port = config.get<number>('RABBITMQ_PORT', 5672);
        const uri = config.get<string>('RABBITMQ_URL') || `amqp://${user}:${pass}@${host}:${port}`;

        return {
          exchanges: [
            {
              name: 'dashroute.events',
              type: 'topic',
            },
          ],
          uri,
          connectionInitOptions: { wait: false },
        };
      },
    }),
  ],
  providers: [RabbitMQPublisherService, RabbitMQConsumerService],
  exports: [GoLevelUpRabbitMQModule, RabbitMQPublisherService],
})
export class RabbitMQModule {}
