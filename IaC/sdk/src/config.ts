import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export interface LambdaFunctionConfig {
  handler: string;
  s3_key: string;
  env: Record<string, string>;
  method: string;
}

export interface AppConfig {
  region: string;
  s3BucketName: string;
  lambdaExecRoleName: string;
  apiGatewayName: string;
  cognitoUserPoolArn: string;
  lambdaFunctions: Record<string, LambdaFunctionConfig>;
}

export const appConfig: AppConfig = {
  region: process.env.AWS_REGION || "ap-northeast-1",
  s3BucketName: process.env.AWS_S3_BUCKET_NAME || "lambda-buket123",
  lambdaExecRoleName: process.env.LAMBDA_EXEC_ROLE_NAME || "lambda_exec_role",
  apiGatewayName: process.env.API_GATEWAY_NAME || "sample-api",
  cognitoUserPoolArn:
    process.env.COGNITO_USER_POOL_ARN ||
    "arn:aws:cognito-idp:ap-northeast-1:718101782941:userpool/ap-northeast-1_uBkpIV0Bb",
  lambdaFunctions: {
    sample: {
      handler: "index.handler",
      s3_key: "sample/index.zip",
      env: { EXAMPLE_KEY: "example_value" },
      method: "POST",
    },
    sample2: {
      handler: "index.handler",
      s3_key: "sample2/index.zip",
      env: { EXAMPLE_KEY: "example_value" },
      method: "GET",
    },
    sample3: {
      handler: "index.handler",
      s3_key: "sample3/index.zip",
      env: { EXAMPLE_KEY: "example_value3" },
      method: "GET",
    },
  },
};
