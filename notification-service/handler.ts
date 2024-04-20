import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new SESClient({ region: "ap-southeast-2" });

export async function sendMail(event) {
  const params = {
    Source: "promie.yutasane@gmail.com",
    Destination: {
      ToAddresses: ["promie.yutasane@gmail.com"],
    },
    Message: {
      Body: {
        Text: {
          Data: "Hello from Serverless",
        },
      },
      Subject: {
        Data: "Test email from Serverless",
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const result = await client.send(command);
    console.log("Email sent", result);
    return result;
  } catch (err) {
    console.error("Error sending email", err);
  }
}
