import { v4 as uuid } from 'uuid'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { ReturnValue } from '@aws-sdk/client-dynamodb'
import {
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import {
  writeRequestsMiddleware,
  readRequestsMiddleware,
} from './lib/commonMiddleware'
import { docClient } from './lib/dynamoDBClients'
import * as createError from 'http-errors'

interface IAuction {
  title: string
}

export async function createAuction(event: APIGatewayProxyEvent) {
  const body = event.body as unknown as IAuction
  const { title } = body
  const now = new Date()

  if (!title) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing title in request body' }),
    }
  }

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    highestBid: {
      amount: 0,
    },
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Item: auction,
  }

  try {
    await docClient.send(new PutCommand(params))

    return {
      statusCode: 201,
      body: JSON.stringify(auction),
    }
  } catch (err) {
    console.log('Error', err)
    throw new createError.InternalServerError(err)
  }
}

export async function getAuctions(event: APIGatewayProxyEvent) {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
  }

  try {
    const auctions = await docClient.send(new ScanCommand(params))

    return {
      statusCode: 200,
      body: JSON.stringify(auctions.Items),
    }
  } catch (err) {
    console.log('Error', err)
    throw new createError.InternalServerError(err)
  }
}

export async function getAuctionsById(id) {
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

export async function getAuction(event: APIGatewayProxyEvent) {
  const { id } = event.pathParameters

  const auction = await getAuctionsById(id)

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  }
}

export async function placeBid(event: APIGatewayProxyEvent) {
  const { id } = event.pathParameters
  const { amount } = event.body as unknown as { amount: number }

  const auction = await getAuctionsById(event)

  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be higher than ${auction.highestBid.amount}`,
    )
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: {
      ':amount': amount,
    },
    ReturnValues: ReturnValue.ALL_NEW,
  }

  try {
    const result = await docClient.send(new UpdateCommand(params))
    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    }
  } catch (err) {
    console.log('Error', err)
    throw new createError.InternalServerError(err)
  }
}

export const createAuctionHandler = writeRequestsMiddleware(createAuction)
export const placeBidHandler = writeRequestsMiddleware(placeBid)
export const getAuctionsHandler = readRequestsMiddleware(getAuctions)
export const getAuctionsByIdHandler = readRequestsMiddleware(getAuction)
