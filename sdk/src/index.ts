import * as cdk from "aws-cdk-lib";
import { LambdaStack } from "../lib/lambda-stack";
import { S3Stack } from "../lib/s3-stack";
import { ApiGatewayStack } from "../lib/api-gateway-stack";

const app = new cdk.App();

// スタックの作成
new LambdaStack(app, "LambdaStack");
new S3Stack(app, "S3Stack");
new ApiGatewayStack(app, "ApiGatewayStack");

app.synth();
