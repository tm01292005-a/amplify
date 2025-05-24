import { defineFunction } from "@aws-amplify/backend";

// Lambda function settings
export const invokeBedrock = defineFunction({
  runtime: 20,
  name: "mysqlHandler",
  entry: "./handler.ts",
  timeoutSeconds: 300,
});
