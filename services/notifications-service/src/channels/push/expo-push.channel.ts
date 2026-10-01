import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { NotificationChannel } from '../notification-channel.interface.js';
import { NotificationPayload } from '../../shared/types/notification-payload.type.js';
import { DevicesService } from '../../devices/devices.service.js';

@Injectable()
export class ExpoPushChannel implements NotificationChannel {
  readonly channelId = 'push';
  private readonly logger = new Logger(ExpoPushChannel.name);
  private expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

  constructor(private readonly devicesService: DevicesService) {}

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

  private async sendWithRetry(message: ExpoPushMessage, token: string, driverId: string, attempt: number): Promise<void> {
    try {
      const tickets = await this.expo.sendPushNotificationsAsync([message]);
      const ticket = tickets[0];

      if (ticket.status === 'error') {
        if (ticket.details?.error === 'DeviceNotRegistered') {
          this.logger.warn(`Expo push invalid token removed for driver ${driverId}`);
          await this.devicesService.removeToken(token);
          return; 
        }

        throw new Error(`Expo error: ${ticket.details?.error || ticket.message}`);
      }
    } catch (err: any) {
      if (attempt >= 3) {
        this.logger.error(`Failed 3 push attempts for driver ${driverId}`, err.stack);
        throw err;
      }
      
      const delayMs = Math.pow(2, attempt - 1) * 1000; 
      this.logger.warn(`Retrying push for driver ${driverId} in ${delayMs}ms (Attempt ${attempt}/3)`);
      
      await new Promise((res) => setTimeout(res, delayMs));
      return this.sendWithRetry(message, token, driverId, attempt + 1);
    }
  }
}
