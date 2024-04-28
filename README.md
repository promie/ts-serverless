# Auction App - Serverless TypeScript Framework
This application utilises the Serverless v.3 Framework with TypeScript. It consists of three distinct serverless modules, with the primary one being the Auction Service. 
This service operates through the API Gateway, establishing endpoints for creating, reading, updating, and placing bids on auctions. Additionally, it includes functionality for uploading images to an S3 bucket. 
Security is managed by the Auth Service, which handles authentication and authorisation via Auth0. The Notification Service integrates AWS's SES and SQS to send alerts to both buyers and sellers upon bid placement on auction items. 
All AWS services are configured and managed through the serverless.yml file using CloudFormation.

## Requirements
- Node 20.11.1 LTS
- NPM 10.x

