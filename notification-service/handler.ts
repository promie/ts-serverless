import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new SESClient({ region: "ap-southeast-2" });

export async function sendMail(event) {
  const record = event.Records[0];
  const email = JSON.parse(record.body);
  const { subject, body, recipient } = email;

  const params = {
    Source: "promie.yutasane@gmail.com",
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Body: {
        Text: {
          Data: body,
        },
      },
      Subject: {
        Data: subject,
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
