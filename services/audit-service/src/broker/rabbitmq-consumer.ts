import type amqp from 'amqplib';
import { logger } from '../logger/logger.js';
import { parseEventEnvelope } from '../schemas/event-envelope.schema.js';
import { type AuditRepository } from '../database/audit-repository.js';

export const EXCHANGE_EVENTS = 'dashroute.events';
export const EXCHANGE_DLX = 'dashroute.dlx';
export const QUEUE_DLX = 'dead.letter.q';
export const QUEUE_AUDIT = 'audit.events.q';

export async function setupRabbitMQTopology(channel: amqp.Channel): Promise<void> {
  await channel.assertExchange(EXCHANGE_DLX, 'fanout', { durable: true });
  await channel.assertQueue(QUEUE_DLX, { durable: true });
  await channel.bindQueue(QUEUE_DLX, EXCHANGE_DLX, '');

  await channel.assertExchange(EXCHANGE_EVENTS, 'topic', { durable: true });
  await channel.assertQueue(QUEUE_AUDIT, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': EXCHANGE_DLX,
    },
  });
  await channel.bindQueue(QUEUE_AUDIT, EXCHANGE_EVENTS, '#');

  logger.info(`Bound queue '${QUEUE_AUDIT}' to exchange '${EXCHANGE_EVENTS}' with routing key '#'`);
}

export function createMessageHandler(auditRepo: AuditRepository) {
  return async (msg: amqp.ConsumeMessage | null, channel: amqp.Channel): Promise<void> => {
    if (!msg) return;

    const rawContent = msg.content.toString();
    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(rawContent);
    } catch {
      logger.warn({ rawContent }, 'Received malformed non-JSON message in audit queue');
      channel.nack(msg, false, false);
      return;
    }

    const { success, data: event, error: valError } = parseEventEnvelope(parsedJson);

    if (!success || !event) {
      logger.warn(
        { errors: valError?.format(), rawContent },
        'Received message that does not match EventEnvelope schema',
      );
      channel.nack(msg, false, false);
      return;
    }

    try {
      const result = await auditRepo.saveAuditLog(event);

      if (result === 'inserted') {
        logger.info(
          { event_id: event.event_id, event_type: event.event_type, producer: event.producer },
          'Successfully audited event',
        );
      } else {
        logger.info(
          { event_id: event.event_id, event_type: event.event_type },
          'Duplicate event detected (already audited), acknowledging message',
        );
      }

      channel.ack(msg);
    } catch (dbErr: unknown) {
      const errorMessage = dbErr instanceof Error ? dbErr.message : String(dbErr);
      logger.error(
        { event_id: event.event_id, err: errorMessage },
        'Failed to insert audit log into database',
      );
      channel.nack(msg, false, false);
    }
  };
}
