import * as jwt from 'jsonwebtoken'
import { APIGatewayProxyEvent } from 'aws-lambda'

// By default, API Gateway authorizations are cached (TTL) for 300 seconds.
// This policy will authorize all requests to the same API Gateway instance where the
// request is coming from, thus being efficient and optimising costs.
const generatePolicy = (principalId: any, methodArn: string) => {
  const apiGatewayWildcard = methodArn.split('/', 2).join('/') + '/*'

  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: apiGatewayWildcard,
        },
      ],
    },
  }
}

export async function auth(event) {
  if (!event.authorizationToken) {
    throw 'Unauthorized'
  }

  const token = event.authorizationToken.replace('Bearer ', '')

  try {
    const claims = jwt.verify(token, process.env.AUTH0_PUBLIC_KEY)
    const policy = generatePolicy(claims.sub, event.methodArn)

    return {
      ...policy,
      context: claims,
    }
  } catch (error) {
    console.log(error)
    throw 'Unauthorized'
  }
}

export async function privateEndpoint(
  event: APIGatewayProxyEvent,
  context: any,
) {
  return {
    statusCode: 200,
    headers: {
      /* Required for CORS support to work */
      'Access-Control-Allow-Origin': '*',
      /* Required for cookies, authorization headers with HTTPS */
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      event,
      context,
    }),
  }
}

export async function publicEndpoint(event: APIGatewayProxyEvent) {
  return {
    statusCode: 200,
    headers: {
      /* Required for CORS support to work */
      'Access-Control-Allow-Origin': '*',
      /* Required for cookies, authorization headers with HTTPS */
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      message: 'Hi ⊂◉‿◉つ from Public API',
    }),
  }
}
