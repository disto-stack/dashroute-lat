import { z } from 'zod';

export const orderDispatchFailedEventSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(1),
  failedAt: z.string().datetime().optional(),
});

export type OrderDispatchFailedEventDto = z.infer<typeof orderDispatchFailedEventSchema>;
