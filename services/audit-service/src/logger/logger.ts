import pino from 'pino';
import { AnyValueMap, logs, SeverityNumber, type Logger as OtelLogger } from '@opentelemetry/api-logs';

const PINO_TO_OTEL_SEVERITY: Record<number, SeverityNumber> = {
  10: SeverityNumber.TRACE,
  20: SeverityNumber.DEBUG,
  30: SeverityNumber.INFO,
  40: SeverityNumber.WARN,
  50: SeverityNumber.ERROR,
  60: SeverityNumber.FATAL,
};
let _otelLogger: OtelLogger | null = null;
function getOtelLogger(): OtelLogger {
  if (!_otelLogger) {
    _otelLogger = logs.getLogger('audit-service');
  }
  return _otelLogger;
}

const otlpStream = {
  write(msg: string): void {
    try {
      const record = JSON.parse(msg) as Record<string, unknown>;
      const level = (record['level'] as number) ?? 30;

      getOtelLogger().emit({
        severityNumber: PINO_TO_OTEL_SEVERITY[level] ?? SeverityNumber.INFO,
        severityText: (record['levelLabel'] as string | undefined) ?? String(level),
        body: (record['msg'] as string) ?? '',
        attributes: record as AnyValueMap,
      });
    } catch {
      // Silently ignore malformed lines — pino should always produce valid JSON
    }
  },
};

export const logger = pino(
  {
    name: 'audit-service',
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      level: (label) => ({ level: label }),
    },
  },

  pino.multistream([{ stream: process.stdout }, { stream: otlpStream }]),
);
