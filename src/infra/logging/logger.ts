import * as api from '@opentelemetry/api'

type Attributes = Record<string, unknown>

const logsApi = (api as any).logs
const SeverityNumber = (api as any).SeverityNumber

const hasLogsApi = logsApi != null && SeverityNumber != null

const logger = hasLogsApi ? logsApi.getLogger('app-logger') : null

export function logInfo(message: string, attributes?: Attributes): void {
  if (logger != null) {
    logger.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: 'INFO',
      body: message,
      attributes,
    })
    return
  }

  console.log(message, attributes)
}

export function logError(
  message: string,
  error?: unknown,
  attributes?: Attributes,
): void {
  if (logger != null) {
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
    return
  }

  console.error(message, error, attributes)
}

