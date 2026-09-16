import { z } from 'zod';

export const EventEnvelopeSchema = z.object({
  event_id: z.string().min(1),
  event_type: z.string().min(1),
  occurred_at: z.string().optional(),
  version: z.string().optional(),
  producer: z.string().min(1),
  payload: z.record(z.unknown()).default({}),
});

export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;

export function parseEventEnvelope(rawJson: unknown): {
  success: boolean;
  data?: EventEnvelope;
  error?: z.ZodError;
} {
  const result = EventEnvelopeSchema.safeParse(rawJson);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function extractOrderId(event: EventEnvelope): string | null {
  if (typeof event.payload.order_id === 'string') {
    return event.payload.order_id;
  }
  if (typeof event.payload.id === 'string' && event.event_type.startsWith('order.')) {
    return event.payload.id;
  }
  return null;
}
