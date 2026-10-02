import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { NotificationChannel } from '../notification-channel.interface.js';
import { NotificationPayload } from '../../shared/types/notification-payload.type.js';
import { DevicesService } from '../../devices/devices.service.js';

@Injectable()
export class ExpoPushChannel implements NotificationChannel {
  readonly channelId = 'push';
  private expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

  constructor(
    @Inject(DevicesService)
    private readonly devicesService: DevicesService,
    @InjectPinoLogger(ExpoPushChannel.name)
    private readonly logger: PinoLogger,
  ) {}

  canHandle(notification: NotificationPayload): boolean {
    return !!notification.expoPushToken && Expo.isExpoPushToken(notification.expoPushToken);
  }

  async send(notification: NotificationPayload): Promise<void> {
    if (!notification.expoPushToken) return;

    const message: ExpoPushMessage = {
      to: notification.expoPushToken,
      sound: 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data,
    };

    await this.sendWithRetry(message, notification.expoPushToken, notification.driverId, 1);
  }

  private async sendWithRetry(
    message: ExpoPushMessage,
    token: string,
    driverId: string,
    attempt: number,
  ): Promise<void> {
    try {
      const tickets = await this.expo.sendPushNotificationsAsync([message]);
      const ticket = tickets[0];

      if (ticket.status === 'error') {
        if (ticket.details?.error === 'DeviceNotRegistered') {
          this.logger.warn({ driverId }, 'Expo push invalid token removed');
          await this.devicesService.removeToken(token);
          return;
        }

        throw new Error(`Expo error: ${ticket.details?.error || ticket.message}`);
      }
    } catch (err: any) {
      if (attempt >= 3) {
        this.logger.error(err.stack, `Failed 3 push attempts for driver ${driverId}`);
        throw err;
      }

      const delayMs = Math.pow(2, attempt - 1) * 1000;
      this.logger.warn(
        { driverId, attempt, delayMs },
        `Retrying push notification (attempt ${attempt}/3)`,
      );

      await new Promise((res) => setTimeout(res, delayMs));
      return this.sendWithRetry(message, token, driverId, attempt + 1);
    }
  }
}
