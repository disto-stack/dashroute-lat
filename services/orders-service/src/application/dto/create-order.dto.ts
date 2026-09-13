import { z } from 'zod';

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const createOrderSchema = z.object({
  pickupLocation: locationSchema,
  dropoffLocation: locationSchema,
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
