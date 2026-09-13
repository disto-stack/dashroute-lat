import { pgTable, timestamp, varchar, jsonb } from 'drizzle-orm/pg-core';

export const orderStatusEnum = ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const;
export type OrderStatus = (typeof orderStatusEnum)[number];

export const orders = pgTable('orders', {
  id: varchar('id', { length: 32 }).primaryKey(),
  customerId: varchar('customer_id', { length: 32 }).notNull(),
  courierId: varchar('courier_id', { length: 32 }),
  status: varchar('status', { length: 50 }).notNull().$type<OrderStatus>().default('PENDING'),
  pickupLocation: jsonb('pickup_location').notNull().$type<{ lat: number; lng: number }>(),
  dropoffLocation: jsonb('dropoff_location').notNull().$type<{ lat: number; lng: number }>(),
  totalAmount: varchar('total_amount', { length: 20 }).notNull().default('0.00'),
  currency: varchar('currency', { length: 3 }).notNull().default('COP'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
