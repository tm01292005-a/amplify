export const handler = async (event) => {
  // サンプルのLambda関数
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
      "Access-Control-Allow-Methods": "OPTIONS, POST",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "Hello from Lambda!", event }),
  };
};
