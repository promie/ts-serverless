import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = "ap-southeast-2";

const client = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(client);

export { client, docClient };
