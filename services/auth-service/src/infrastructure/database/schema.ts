import { pgTable, pgEnum, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['CUSTOMER', 'COURIER', 'DISPATCHER', 'ADMIN']);

export const vehicleTypeEnum = pgEnum('vehicle_type', ['BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN']);

export const users = pgTable('users', {
  id: varchar('id', { length: 32 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  role: userRoleEnum('role').notNull().default('CUSTOMER'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const couriers = pgTable('couriers', {
  id: varchar('id', { length: 32 }).primaryKey(),
  userId: varchar('user_id', { length: 32 })
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  vehicleType: vehicleTypeEnum('vehicle_type').notNull().default('MOTORCYCLE'),
  plateNumber: varchar('plate_number', { length: 20 }),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ one }) => ({
  courier: one(couriers, {
    fields: [users.id],
    references: [couriers.userId],
  }),
}));

export const couriersRelations = relations(couriers, ({ one }) => ({
  user: one(users, {
    fields: [couriers.userId],
    references: [users.id],
  }),
}));

export type UserTable = typeof users.$inferSelect;
export type NewUserTable = typeof users.$inferInsert;

export type CourierTable = typeof couriers.$inferSelect;
export type NewCourierTable = typeof couriers.$inferInsert;
