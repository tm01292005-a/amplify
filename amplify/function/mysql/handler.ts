import { APIGatewayProxyHandler } from "aws-lambda";
import mysql from "mysql2/promise";

// Lambda function
export const handler: APIGatewayProxyHandler = async (event) => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows] = await connection.execute("SELECT * FROM your_table");
  await connection.end();

  return {
    statusCode: 200,
    body: JSON.stringify(rows),
  };
};
