import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // event.body にリクエストボディ（JSON文字列）が入る
  const body = event.body ? JSON.parse(event.body) : {};
  // サンプルのLambda関数
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from Lambda21!",
      event,
      query: event.queryStringParameters,
    }),
  };
};
