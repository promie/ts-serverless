import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import httpEventNormalizer from '@middy/http-event-normalizer'
import httpErrorHandler from '@middy/http-error-handler'
import validator from '@middy/validator'
import { transpileSchema } from '@middy/validator/transpile'

/**
 * Enhanced Middleware for POST, PUT, PATCH requests
 * - `jsonBodyParser` parses the incoming request body if it's JSON, making it easier to work with.
 * - `httpEventNormalizer` ensures that API Gateway events are consistent and predictable.
 * - `httpErrorHandler` catches errors and formats them properly.
 * - Optionally includes validator middleware if a validation schema is provided for body validation.
 */
const writeRequestsMiddleware = (handler, schema = null) => {
  const middleware = middy(handler).use([
    jsonBodyParser(),
    httpEventNormalizer(),
    httpErrorHandler(),
  ])

  if (schema) {
    middleware.use(validator({ eventSchema: transpileSchema(schema) }))
  }

  return middleware
}

/**
 * Enhanced Middleware for GET requests
 * - Optionally includes validator middleware if a validation schema is provided.
 */
const readRequestsMiddleware = (handler, schema = null) => {
  const middleware = middy(handler).use([
    httpEventNormalizer(),
    httpErrorHandler(),
  ])

  if (schema) {
    middleware.use(validator({ eventSchema: transpileSchema(schema) }))
  }

  return middleware
}

export { writeRequestsMiddleware, readRequestsMiddleware }
