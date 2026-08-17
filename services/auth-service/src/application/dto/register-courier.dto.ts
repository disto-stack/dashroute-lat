import { z } from 'zod';

export const vehicleTypeSchema = z.enum(['BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN']);

export const registerCourierSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(150),
  vehicleType: vehicleTypeSchema.default('MOTORCYCLE'),
  plateNumber: z.string().max(20).optional().nullable(),
});

export type RegisterCourierDto = z.infer<typeof registerCourierSchema>;
