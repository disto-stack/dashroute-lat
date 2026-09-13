import { describe, it, expect } from 'vitest';
import { ZodValidationPipe } from '../../../../../src/infrastructure/http/pipes/zod-validation.pipe.js';
import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';

describe('ZodValidationPipe', () => {
  const testSchema = z.object({
    name: z.string().min(3),
    age: z.number().positive(),
  });

  const pipe = new ZodValidationPipe(testSchema);

  it('should transform and return parsed value when validation passes', () => {
    const input = { name: 'John Doe', age: 30 };
    const result = pipe.transform(input);

    expect(result).toEqual(input);
  });

  it('should throw BadRequestException when validation fails', () => {
    const invalidInput = { name: 'Jo', age: -5 };

    expect(() => pipe.transform(invalidInput)).toThrow(BadRequestException);
  });
});
