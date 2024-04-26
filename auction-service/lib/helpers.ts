import { GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { docClient } from './dynamoDBClients'
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import * as createError from 'http-errors'
import { ReturnValue } from '@aws-sdk/client-dynamodb'

const sqs = new SQSClient({ region: 'ap-southeast-2' })
const s3 = new S3Client({ region: 'ap-southeast-2' })

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
    IndexName: 'statusAndEndDate',
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

  await docClient.send(new UpdateCommand(params))

  const { title, seller, highestBid } = auction
  const { amount, bidder } = highestBid

  // If there are no bids, notify the seller
  if (amount === 0) {
    return await sqs.send(
      new SendMessageCommand({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
          subject: 'No bids on your auction item :(',
          recipient: seller,
          body: `Oh no! Your item "${title}" didn't get any bids. Better luck next time!`,
        }),
      }),
    )
  }

  // Notify the seller and the bidder if the item was sold
  const notifySeller = sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: 'Your item has been sold!',
        recipient: seller,
        body: `Woohoo! Your item "${title}" has been sold for $${amount}.`,
      }),
    }),
  )

  const notifyBidder = sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: 'You won an auction!',
        recipient: bidder,
        body: `What a great deal! You got yourself a "${title}"`,
      }),
    }),
  )

  return Promise.all([notifySeller, notifyBidder])
}

const uploadPictureToS3 = async (key: string, body: Buffer) => {
  const params = {
    Bucket: process.env.AUCTIONS_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentEncoding: 'base64',
    ContentType: 'image/jpeg',
  }

  await s3.send(new PutObjectCommand(params))

  const command = new PutObjectCommand({
    Bucket: params.Bucket,
    Key: params.Key,
  })

  const signedUrl = await getSignedUrl(s3, command)

  return signedUrl
}

const setAuctionPictureUrl = async (id: string, pictureUrl: string) => {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set pictureUrl = :pictureUrl',
    ExpressionAttributeValues: {
      ':pictureUrl': pictureUrl,
    },
    ReturnValues: ReturnValue.ALL_NEW,
  }

  const result = await docClient.send(new UpdateCommand(params))

  return result.Attributes
}

export {
  getAuctionsById,
  getEndedAuctions,
  closeAuction,
  uploadPictureToS3,
  setAuctionPictureUrl,
}
