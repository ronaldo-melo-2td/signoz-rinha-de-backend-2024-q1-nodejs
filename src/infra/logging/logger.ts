import { logs, SeverityNumber } from '@opentelemetry/api-logs'

type Attributes = Record<string, unknown>

const logger = logs.getLogger('app-logger')

export function logInfo(message: string, attributes?: Attributes): void {
  logger.emit({
    severityNumber: SeverityNumber.INFO,
    severityText: 'INFO',
    body: message,
    attributes,
  })
}

export function logError(
  message: string,
  error?: unknown,
  attributes?: Attributes,
): void {
  logger.emit({
    severityNumber: SeverityNumber.ERROR,
    severityText: 'ERROR',
    body: message,
    attributes: {
      ...attributes,
      error:
        error instanceof Error
          ? error.message
          : error != null
            ? String(error)
            : undefined,
    },
  })
}

