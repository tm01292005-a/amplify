import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
      "Access-Control-Allow-Methods": "OPTIONS, GET",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      message: "Hello from Lambda3!",
      event,
      query: event.queryStringParameters,
    }),
  };
};
