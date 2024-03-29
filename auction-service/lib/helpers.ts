import { GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { docClient } from './dynamoDBClients'
import * as createError from 'http-errors'

const getAuctionsById = async (id: string) => {
  let auction: Record<string, any>

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
  }

  try {
    const result = await docClient.send(new GetCommand(params))

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `Auction id ${id} not found.` }),
      }
    }

    auction = result.Item
  } catch (err) {
    console.log('Error', err)
    throw new createError.InternalServerError(err)
  }

  if (!auction) {
    throw new createError.NotFound(`Auction with ID "${id}" not found`)
  }

  return auction
}

const getEndedAuctions = async () => {
  const now = new Date()

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    KeyConditionExpression: '#status = :status AND endingAt <= :now',
    ExpressionAttributeValues: {
      ':status': 'OPEN',
      ':now': now.toISOString(),
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  }

  const result = await docClient.send(new QueryCommand(params))

  return result.Items
}

const closeAuction = async (auction: Record<string, any>) => {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: auction.id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': 'CLOSED',
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  }

  const result = await docClient.send(new UpdateCommand(params))

  return result
}

export { getAuctionsById, getEndedAuctions, closeAuction }
