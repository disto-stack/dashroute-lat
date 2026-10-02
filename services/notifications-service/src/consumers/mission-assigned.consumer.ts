import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import * as amqp from 'amqplib';
import { NotificationDispatcher } from '../dispatcher/notification.dispatcher.js';
import * as databaseProvider from '../database/database.provider.js';
import { processedEvents } from '../database/schema.js';
import { DevicesService } from '../devices/devices.service.js';

const EXCHANGE_EVENTS = 'dashroute.events';
const QUEUE_NOTIFICATIONS = 'notifications.delivery.assigned.q';
const ROUTING_KEY = 'delivery.assigned';

const EXCHANGE_DLX = 'dashroute.dlx';
const QUEUE_DLX = 'dead.letter.q';

@Injectable()
export class MissionAssignedConsumer implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  constructor(
    @Inject(NotificationDispatcher)
    private readonly dispatcher: NotificationDispatcher,
    @Inject(DevicesService)
    private readonly devicesService: DevicesService,
    @Inject(databaseProvider.DRIZZLE_DB) private readonly db: databaseProvider.DrizzleDb,
    @InjectPinoLogger(MissionAssignedConsumer.name)
    private readonly logger: PinoLogger,
  ) {}

  async onModuleInit() {
    await this.connectRabbitMQ();
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  private async connectRabbitMQ() {
    const user = process.env.RABBITMQ_USER || 'guest';
    const pass = process.env.RABBITMQ_PASS || 'guest';
    const host = process.env.RABBITMQ_HOST || 'localhost';
    const port = process.env.RABBITMQ_PORT || '5672';
    const rabbitUrl = process.env.RABBITMQ_URL || `amqp://${user}:${pass}@${host}:${port}`;
    try {
      this.connection = await amqp.connect(rabbitUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(EXCHANGE_DLX, 'fanout', { durable: true });
      await this.channel.assertQueue(QUEUE_DLX, { durable: true });
      await this.channel.bindQueue(QUEUE_DLX, EXCHANGE_DLX, '');

      await this.channel.assertExchange(EXCHANGE_EVENTS, 'topic', { durable: true });
      await this.channel.assertQueue(QUEUE_NOTIFICATIONS, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': EXCHANGE_DLX,
        },
      });
      await this.channel.bindQueue(QUEUE_NOTIFICATIONS, EXCHANGE_EVENTS, ROUTING_KEY);

      this.logger.info(`Listening to RabbitMQ on queue ${QUEUE_NOTIFICATIONS}`);

      this.channel.consume(QUEUE_NOTIFICATIONS, async (msg: any) => {
        if (!msg) return;
        await this.handleMessage(msg);
      });
    } catch (err) {
      this.logger.error((err as Error).stack, 'Failed to connect to RabbitMQ');
    }
  }

  private async handleMessage(msg: amqp.ConsumeMessage) {
    try {
      const content = msg.content.toString();
      const parsed = JSON.parse(content);

      if (!parsed.event_id || parsed.event_type !== 'delivery.assigned' || !parsed.payload) {
        this.logger.warn({ parsed }, 'Invalid event envelope');
        this.channel?.nack(msg, false, false);
        return;
      }

      const eventId = parsed.event_id;

      const insertResult = await this.db
        .insert(processedEvents)
        .values({ eventId })
        .onConflictDoNothing()
        .returning({ insertedId: processedEvents.eventId });

      if (insertResult.length === 0) {
        this.logger.info({ eventId }, 'Event already processed, skipping');
        this.channel?.ack(msg);
        return;
      }

      const payload = parsed.payload;

      const pushToken = await this.devicesService.findTokenByDriverId(payload.courierId);

      const notificationPayload = {
        missionId: payload.orderId,
        driverId: payload.courierId,
        title: 'New Delivery Assigned!',
        body: `You have been assigned to order: ${payload.orderId}`,
        data: payload,
        expoPushToken: pushToken,
        recipientPreferences: {},
      };

      await this.dispatcher.dispatch(notificationPayload);

      this.channel?.ack(msg);
      this.logger.info(
        { eventId, courierId: payload.courierId, orderId: payload.orderId },
        'Successfully processed delivery.assigned event',
      );
    } catch (err) {
      this.logger.error((err as Error).stack, 'Error processing message');
      this.channel?.nack(msg, false, false);
    }
  }
}
