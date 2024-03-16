import { v4 as uuid } from 'uuid';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import commonMiddleware from "./lib/commonMiddleware";
import * as createError from 'http-errors';

export async function createAuction(event: APIGatewayProxyEvent) {

  const body = event.body as unknown as { title: string };
  const { title } = body;
  const now = new Date();

  if (!title) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing title in request body" })
    };
  }

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
  };

  const client = new DynamoDBClient({ region: "ap-southeast-2" });
  const docClient = DynamoDBDocumentClient.from(client);

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Item: auction,
  };

  try {
    await docClient.send(new PutCommand(params));

    return {
      statusCode: 201,
      body: JSON.stringify(auction)
    };
  } catch (err) {
    console.log("Error", err);
    throw new createError.InternalServerError(err);
  }
}

export async function getAuctions(event: APIGatewayProxyEvent) {
  const client = new DynamoDBClient({ region: 'ap-southeast-2' })
  const docClient = DynamoDBDocumentClient.from(client)

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME
  }

  try {
    const auctions = await docClient.send(new ScanCommand(params))

    return {
      statusCode: 200,
      body: JSON.stringify(auctions.Items)
    }
  }catch(err) {
    console.log('Error', err)
    throw new createError.InternalServerError(err)
  }
}

export async function getAuctionsById(event: APIGatewayProxyEvent) {

  const client = new DynamoDBClient( { region: 'ap-southeast-2' })
  const docClient = DynamoDBDocumentClient.from(client)

  const { id } = event.pathParameters

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id }
  }

  try {
    const result = await docClient.send(new GetCommand(params))

    if(!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `Auction id ${id} not found.`})
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item)
    }

  }catch(err) {
    console.log('Error', err)
    throw new createError.InternalServerError(err)
  }
}

export const createAuctionHandler = commonMiddleware(createAuction);
export const getAuctionsHandler = commonMiddleware(getAuctions);
export const getAuctionsByIdHandler = commonMiddleware(getAuctionsById);
