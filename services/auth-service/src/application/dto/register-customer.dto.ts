import { z } from 'zod';

export const registerCustomerSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(150),
});

export type RegisterCustomerDto = z.infer<typeof registerCustomerSchema>;
