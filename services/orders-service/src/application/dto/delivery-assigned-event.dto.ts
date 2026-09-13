import { z } from 'zod';

export const deliveryAssignedEventSchema = z.object({
  orderId: z.string().uuid(),
  courierId: z.string().uuid(),
  assignedAt: z.string().datetime().optional(),
});

export type DeliveryAssignedEventDto = z.infer<typeof deliveryAssignedEventSchema>;
