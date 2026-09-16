import amqp from 'amqplib';
import pg from 'pg';
import { logger } from './logger/logger.js';
import { envConfig } from './config/env.config.js';
import { AuditRepository } from './database/audit-repository.js';
import {
  setupRabbitMQTopology,
  createMessageHandler,
  QUEUE_AUDIT,
} from './broker/rabbitmq-consumer.js';

async function bootstrap() {
  await new Promise((r) => setTimeout(r, 200));
  logger.info('Initializing Audit Service worker...');

  const pool = new pg.Pool({
    host: envConfig.db.host,
    port: envConfig.db.port,
    user: envConfig.db.user,
    password: envConfig.db.password,
    database: envConfig.db.name,
  });

  try {
    const client = await pool.connect();
    logger.info('Successfully connected to PostgreSQL database');
    client.release();
  } catch (error) {
    logger.error({ err: error }, 'Failed to connect to PostgreSQL database');
    process.exit(1);
  }

  const auditRepo = new AuditRepository({ pool });

  let connection: amqp.ChannelModel;
  let channel: amqp.Channel;

  try {
    connection = await amqp.connect(envConfig.rabbitmq.url);
    channel = await connection.createChannel();
    logger.info('Successfully connected to RabbitMQ broker');
  } catch (error) {
    logger.error({ err: error }, 'Failed to connect to RabbitMQ broker');
    process.exit(1);
  }

  await setupRabbitMQTopology(channel);
  channel.prefetch(10);

  const handleMessage = createMessageHandler(auditRepo);

  channel.consume(QUEUE_AUDIT, (msg) => {
    handleMessage(msg, channel);
  });

  logger.info('Audit Service worker is listening for events...');

  const shutdown = async () => {
    logger.info('Shutting down Audit Service worker...');
    try {
      await channel.close();
      await connection.close();
      await pool.end();
      logger.info('Audit Service shut down cleanly.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Fatal error starting Audit Service');
  process.exit(1);
});
