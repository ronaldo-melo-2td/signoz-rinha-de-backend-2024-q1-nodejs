import './infra/monitoring/otel'

import fastify, { type FastifyInstance } from 'fastify'
import { type IncomingMessage, type Server, type ServerResponse } from 'http'
import router from './infra/routers/router'
import { logError, logInfo } from './infra/logging/logger'

const server: FastifyInstance<Server, IncomingMessage, ServerResponse> =
  fastify({ logger: false })

void server.register(router)

server.listen({ port: 8080, host: '0.0.0.0' }, () => {
  logInfo('running on port 8080')
})

const errors = ['uncaughtException', 'unhandledRejection', 'SIGTERM', 'SIGINT']

errors.forEach((error) => {
  process.on(error, async (err) => {
    logError('Unhandled error', err)
    await server.close()
    process.exit(1)
  })
})