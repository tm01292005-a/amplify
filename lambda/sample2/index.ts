import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // event.body にリクエストボディ（JSON文字列）が入る
  const body = event.body ? JSON.parse(event.body) : {};
  // サンプルのLambda関数
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
      "Access-Control-Allow-Methods": "OPTIONS, GET",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      message: "Hello from Lambda2!",
      event,
      query: event.queryStringParameters,
    }),
  };
};
