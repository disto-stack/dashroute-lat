import { z } from 'zod';

export const DIAGNOSIS_CATEGORIES = [
  'NO_COURIERS_NEARBY',
  'ALL_COURIERS_BUSY',
  'COURIERS_LOCKED',
  'SYSTEMIC_OUTAGE',
  'ORDER_DATA_ISSUE',
  'UNKNOWN',
] as const;

export const diagnosisSchema = z.object({
  category: z.enum(DIAGNOSIS_CATEGORIES),
  summary: z.string().min(1).max(500),
  evidence: z.array(z.string().min(1).max(300)).min(1).max(5),
  confidence: z.enum(['low', 'medium', 'high']),
});

export type Diagnosis = z.infer<typeof diagnosisSchema>;

export const SUBMIT_DIAGNOSIS_TOOL = 'submit_diagnosis';

export const submitDiagnosisSpec = {
  name: SUBMIT_DIAGNOSIS_TOOL,
  description:
    'Submit the final diagnosis. Call this exactly once, when you have enough evidence, or with category UNKNOWN if the evidence is insufficient.',
  inputSchema: {
    type: 'object',
    additionalProperties: false,
    required: ['category', 'summary', 'evidence', 'confidence'],
    properties: {
      category: { type: 'string', enum: [...DIAGNOSIS_CATEGORIES] },
      summary: { type: 'string', maxLength: 500 },
      evidence: {
        type: 'array',
        minItems: 1,
        maxItems: 5,
        items: { type: 'string', maxLength: 300 },
      },
      confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    },
  },
};
