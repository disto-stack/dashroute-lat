import { z } from 'zod';

export const getOrdersQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  cursor: z.string().optional(),
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED']).optional(),
  customerId: z.string().uuid().optional(),
  courierId: z.string().uuid().optional(),
});

export type GetOrdersQueryDto = z.infer<typeof getOrdersQuerySchema>;
