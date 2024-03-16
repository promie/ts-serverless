import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import httpEventNormalizer from '@middy/http-event-normalizer'
import httpErrorHandler from '@middy/http-error-handler'

/**
 * Middleware for POST, PUT, PATCH requests
 * - `jsonBodyParser` parses the incoming request body if it's JSON, making it easier to work with.
 * - `httpEventNormalizer` ensures that API Gateway events are consistent and predictable.
 * - `httpErrorHandler` catches errors and formats them properly.
 */
const writeRequestsMiddleware = handler =>
  middy(handler).use([
    jsonBodyParser(),
    httpEventNormalizer(),
    httpErrorHandler(),
  ])

/**
 * Middleware for GET requests
 * - Excludes `jsonBodyParser` as GET requests do not typically contain a body.
 * - `httpEventNormalizer` and `httpErrorHandler` are still useful for handling query parameters and errors respectively.
 */
const readRequestsMiddleware = handler =>
  middy(handler).use([httpEventNormalizer(), httpErrorHandler()])

export { writeRequestsMiddleware, readRequestsMiddleware }
