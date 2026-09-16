import type pg from 'pg';
import { type EventEnvelope, extractOrderId } from '../schemas/event-envelope.schema.js';

export interface AuditRepositoryOptions {
  pool: pg.Pool;
}

export type InsertResult = 'inserted' | 'duplicate';

export class AuditRepository {
  private pool: pg.Pool;

  constructor(options: AuditRepositoryOptions) {
    this.pool = options.pool;
  }

  async saveAuditLog(event: EventEnvelope): Promise<InsertResult> {
    const orderId = extractOrderId(event);

    try {
      await this.pool.query(
        `INSERT INTO audit_logs (event_id, order_id, event_type, producer, payload)
         VALUES ($1, $2, $3, $4, $5)`,
        [event.event_id, orderId, event.event_type, event.producer, JSON.stringify(event.payload)],
      );
      return 'inserted';
    } catch (dbErr: unknown) {
      if (
        typeof dbErr === 'object' &&
        dbErr !== null &&
        'code' in dbErr &&
        (dbErr as { code?: string }).code === '23505'
      ) {
        return 'duplicate';
      }
      throw dbErr;
    }
  }
}
