import { NotificationPayload } from '../shared/types/notification-payload.type.js';
import { RecipientPreferences } from '../shared/types/recipient-preferences.type.js';

export interface NotificationChannel {
  readonly channelId: string;
  canHandle(notification: NotificationPayload): boolean;
  send(notification: NotificationPayload): Promise<void>;
}

export const NOTIFICATION_CHANNELS = 'NOTIFICATION_CHANNELS';
