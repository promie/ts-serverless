import { SESClient } from "@aws-sdk/client-ses";

const client = new SESClient({ region: "ap-southeast-2" });

export async function sendMail(event) {
  console.log("event", event);

  return event;
}
