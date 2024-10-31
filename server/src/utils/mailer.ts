import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  FROM_MAIL,
  FROM_NAME,
} from "./config";
import { render } from "@react-email/components";
import React from "react";

let client: SESClient;

export const getSesClient = async () => {
  if (!client) {
    client = new SESClient({
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
      region: AWS_REGION,
    });
  }

  return client;
};

export const sendEmail = async <T extends object>(
  Template: (props: T) => React.ReactElement,
  props: T,
  email: string,
  subject: string
) => {
  try {
    const emailHtml = await render(Template(props));
    const client = await getSesClient();

    const command = new SendEmailCommand({
      Source: `${FROM_NAME} <${FROM_MAIL}>`,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: emailHtml,
          },
        },
      },
    });

    const res = await client.send(command);
    return res.$metadata.httpStatusCode === 200;
  } catch (error) {
    console.error("Failed to send email", error);
    return false;
  }
};
