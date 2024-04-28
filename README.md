# Auction App - Serverless TypeScript Framework
The Auction App leverages the Serverless v.3 Framework, crafted with TypeScript, and architecturally divided into three interconnected services:

1. **Auction Service**: The core of the app, interfacing through AWS API Gateway. It includes functions for auction operations such as `createAuction`, `getAuctions`, `getAuction`, `placeBid`, and `uploadAuctionPicture`. This service is responsible for processing auctions via AWS EventBridge and storing auction data in AWS DynamoDB's AuctionsTable, while auction images are hosted in the S3 AuctionsBucket.
2. **Auth Service**: Serving as the security gatekeeper, it authorizes API requests using JSON Web Tokens (JWT) with an `authorizer` function, ensuring secure access control.
3. **Notification Service**: This component is pivotal for communication, utilising AWS Simple Email Service (SES) to dispatch emails and AWS Simple Queue Service (SQS) for managing mail queues, thereby enabling timely notifications to buyers and sellers upon auction activities.

Each service is meticulously orchestrated through AWS CloudFormation as defined in the `serverless.yml` file, providing a cohesive, automated, and scalable auction platform.
Please refer to the workflow diagram below for a detailed visual representation of the app's architecture and interaction between services.

## Architecture Diagram
![Auction App Architecture](https://pytech-assets.s3.ap-southeast-2.amazonaws.com/serverless.png)

## Requirements
- Node 20.11.1 LTS
- NPM 10.x
- Serverless Framework 3.x
- AWS Credentials

## Installation
For each of the services, please navigate to the respective directory and run the following commands:
```bash
npm install
```

## Deployment
To deploy the services, please navigate to the respective directory and run the following commands:
```bash
sls deploy -v
```

## Removal
To remove the services, please navigate to the respective directory and run the following commands:
```bash
sls remove -v
```
