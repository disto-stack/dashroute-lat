import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

export const deviceTokens = pgTable('device_tokens', {
  id: varchar('id', { length: 32 }).primaryKey(),
  driverId: varchar('driver_id', { length: 32 }).notNull().unique(),
  expoPushToken: varchar('expo_push_token', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const processedEvents = pgTable('notifications_processed_events', {
  eventId: varchar('event_id', { length: 36 }).primaryKey(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
});
