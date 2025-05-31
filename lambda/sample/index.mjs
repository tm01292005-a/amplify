export const handler = async (event) => {
    // サンプルのLambda関数
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Hello from Lambda!", event }),
    };
};
