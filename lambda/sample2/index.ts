import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
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
