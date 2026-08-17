import { z } from 'zod';

export const verifyCourierSchema = z.object({
  isVerified: z.boolean({
    required_error: 'isVerified is required',
    invalid_type_error: 'isVerified must be a boolean',
  }),
});

export type VerifyCourierDto = z.infer<typeof verifyCourierSchema>;
