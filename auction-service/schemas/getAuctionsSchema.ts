const schema = {
  type: 'object',
  properties: {
    queryStringParameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['open', 'closed'],
        },
      },
    },
  },
  required: ['queryStringParameters'],
}

export default schema
