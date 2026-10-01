import { RecipientPreferences } from './recipient-preferences.type.js';

export interface NotificationPayload {
  missionId: string;
  driverId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  expoPushToken?: string | null;
  recipientPreferences: RecipientPreferences;
}
