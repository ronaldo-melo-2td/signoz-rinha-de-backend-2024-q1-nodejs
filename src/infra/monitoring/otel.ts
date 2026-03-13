import {
    diag,
    DiagConsoleLogger,
    DiagLogLevel,
} from '@opentelemetry/api'

import { NodeSDK } from '@opentelemetry/sdk-node'

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { FastifyOtelInstrumentation } from '@fastify/otel';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'

import {
    PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';

import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'

import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

function normalizeOtlpGrpcUrl(endpoint: string | undefined): string | undefined {
    if (endpoint == null || endpoint === '') {
        return undefined
    }

    const sanitizedEndpoint = endpoint.replace(/\/$/, '')

    if (/^[a-z]+:\/\//i.test(sanitizedEndpoint)) {
        return sanitizedEndpoint
    }

    return `http://${sanitizedEndpoint}`
}

const sharedOtlpEndpoint =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
    process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT

const metricsOptions = {
    url: normalizeOtlpGrpcUrl(
        process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ?? sharedOtlpEndpoint,
    ),
    compression: CompressionAlgorithm.GZIP,
}

const tracesOptions = {
    url: normalizeOtlpGrpcUrl(
        process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? sharedOtlpEndpoint,
    ),
    compression: CompressionAlgorithm.GZIP,
}

const logsOptions = {
    url: normalizeOtlpGrpcUrl(
        process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ?? sharedOtlpEndpoint,
    ),
    compression: CompressionAlgorithm.GZIP,
}

const metricExporter = new OTLPMetricExporter(metricsOptions);

const traceExporter = new OTLPTraceExporter(tracesOptions)
const logExporter = new OTLPLogExporter(logsOptions)

const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: Number(process.env.OTEL_METRIC_EXPORT_INTERVAL),
    exportTimeoutMillis: Number(process.env.OTEL_METRIC_EXPORT_TIMEOUT),
})

const logRecordProcessor = new BatchLogRecordProcessor(logExporter)

const fastifyOtelInstrumentation = new FastifyOtelInstrumentation({
    registerOnInitialization: true,
})
const sdk = new NodeSDK({
    logRecordProcessors: [logRecordProcessor],
    metricReader,
    traceExporter,
    instrumentations: [
        getNodeAutoInstrumentations({}),
        fastifyOtelInstrumentation,
    ]
});

process.on('beforeExit', async () => {
    await sdk.shutdown()
})

sdk.start()

export { }