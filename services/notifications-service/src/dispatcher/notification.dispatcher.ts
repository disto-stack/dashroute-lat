import { Injectable, Inject } from '@nestjs/common';
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
  ) {}

  async dispatch(notification: NotificationPayload): Promise<void> {
    const applicable = this.channels.filter((ch) =>
      ch.canHandle(notification),
    );
    
    await Promise.allSettled(
      applicable.map((ch) => ch.send(notification)),
    );
  }
}
