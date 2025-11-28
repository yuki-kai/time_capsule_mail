import type { APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { SchedulerClient, CreateScheduleCommand, FlexibleTimeWindowMode } from "@aws-sdk/client-scheduler";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "OPTIONS,POST"
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      throw new Error("bodyが空です");
    }

    const body = JSON.parse(event.body);
    const scheduledAt = new Date(body.scheduledAt);
    if (isNaN(scheduledAt.getTime())) {
      throw new Error("scheduledAt が不正です");
    }

    // 環境変数チェック
    if (!process.env.TARGET_LAMBDA_ARN) {
      throw new Error("TARGET_LAMBDA_ARN が未設定です");
    }
    if (!process.env.SCHEDULER_ROLE_ARN) {
      throw new Error("SCHEDULER_ROLE_ARN が未設定です");
    }

    // スケジュール設定
    const isoNoMs = scheduledAt.toISOString().replace(/\.\d{3}Z$/, "");
    const scheduleExpression = `at(${isoNoMs})`;

    if (!process.env.TARGET_LAMBDA_ARN) throw new Error("TARGET_LAMBDA_ARN が未設定です");
    if (!process.env.SCHEDULER_ROLE_ARN) throw new Error("SCHEDULER_ROLE_ARN が未設定です");

    const scheduleName = `scheduled-${scheduleExpression}`;
    const cmd = new CreateScheduleCommand({
      Name: `${Date.now()}`,
      ScheduleExpression: scheduleExpression,
      ScheduleExpressionTimezone: "Asia/Tokyo",
      FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
      Target: {
        // 実行対象のLambdaのARN
        Arn: process.env.TARGET_LAMBDA_ARN,
        // SchedulerがAssumeしてターゲットを実行するためのロールのARN
        RoleArn: process.env.SCHEDULER_ROLE_ARN,
        Input: JSON.stringify({
          type: "scheduled_event",
          payload: body,
        }),
      },
      Description: `one-shot schedule for ${scheduleName}`,
      State: "ENABLED",
      ActionAfterCompletion: "DELETE",
    });

    const schedulerClient = new SchedulerClient({ region: "ap-northeast-1" });
    const resp = await schedulerClient.send(cmd);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: "Schedule created successfully",
        scheduleName,
        scheduleArn: resp.ScheduleArn,
        scheduledAt: isoNoMs,
      }),
    };
  } catch (error: any) {
    console.error("Error creating schedule:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error?.message ?? String(error) }),
    };
  }
};
