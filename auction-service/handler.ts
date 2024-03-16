import { v4 as uuid } from 'uuid';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import middy from '@middy/core'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";

export async function createAuction(event) {
  const body = JSON.parse(event.body);
  if (!body.title) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing title in request body" })
    };
  }

  const { title } = body;
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString()
  };

  const client = new DynamoDBClient({ region: "ap-southeast-2" });
  const docClient = DynamoDBDocumentClient.from(client);

  const params = {
    // @ts-ignore
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

    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message })
    };
  }
}

export const handler = middy()
.use(httpJsonBodyParser())
.use(httpEventNormalizer())
.use(httpErrorHandler())
.handler(createAuction)