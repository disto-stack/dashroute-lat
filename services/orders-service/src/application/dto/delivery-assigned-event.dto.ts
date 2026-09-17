import { z } from 'zod';

export const deliveryAssignedEventSchema = z.object({
  orderId: z.string().min(1),
  courierId: z.string().min(1),
  assignedAt: z.string().datetime().optional(),
});

export type DeliveryAssignedEventDto = z.infer<typeof deliveryAssignedEventSchema>;
