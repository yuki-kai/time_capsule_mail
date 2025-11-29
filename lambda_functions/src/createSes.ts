import { SESClient, SendEmailCommand, MessageRejected } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: "ap-northeast-1" });

type ScheduledEvent = {
  type: 'scheduled_event';
  payload: {
    title: string,
    body: string,
    email: string,
    scheduledAt: string,
  };
}

export const handler = async (event: ScheduledEvent) => {
  const { email, title, body } = event.payload

  try {
    const command = new SendEmailCommand({
      Source: email, // TODO: noreply@hoge.com的な固定のメールアドレスを取得して設定する
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: title },
        Body: {
          Text: { Data: body },
        },
      },
    });
    await sesClient.send(command);
    console.log("SESに登録しました:", event.payload);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Ses invoked successfully",
      }),
    }
  } catch (error: any) {
    console.error("Error invoke ses:", error);
    if (error instanceof MessageRejected) {
      console.error("メールアドレスは検証されていません:", error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error?.message ?? String(error) }),
      };
    } else {
      console.error("予期せぬエラーが発生しました:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error?.message ?? String(error) }),
      };
    }
  }
};
