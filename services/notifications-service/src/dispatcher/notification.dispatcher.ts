import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  NotificationChannel,
  NOTIFICATION_CHANNELS,
} from '../channels/notification-channel.interface.js';
import { NotificationPayload } from '../shared/types/notification-payload.type.js';

@Injectable()
export class NotificationDispatcher {
  constructor(
    @Inject(NOTIFICATION_CHANNELS)
    private readonly channels: NotificationChannel[],
    @InjectPinoLogger(NotificationDispatcher.name)
    private readonly logger: PinoLogger,
  ) {}

  async dispatch(notification: NotificationPayload): Promise<void> {
    const applicable = this.channels.filter((ch) => ch.canHandle(notification));

    this.logger.info(
      { driverId: notification.driverId, channels: applicable.map((c) => c.channelId) },
      'Dispatching notification',
    );

    const results = await Promise.allSettled(applicable.map((ch) => ch.send(notification)));

    for (const [i, result] of results.entries()) {
      if (result.status === 'rejected') {
        this.logger.error(
          (result.reason as Error).stack,
          `Channel ${applicable[i].channelId} failed to send notification`,
        );
      }
    }
  }
}
