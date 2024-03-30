const schema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        amount: { type: 'number' },
      },
      required: ['amount'],
    },
  },
}

export default schema
