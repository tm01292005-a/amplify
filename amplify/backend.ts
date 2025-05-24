import { defineBackend } from "@aws-amplify/backend";
import * as iam from "aws-cdk-lib/aws-iam";

import { auth } from "./auth/resource";
import { invokeBedrock } from "./function/mysql/resource";
import { Stack } from "aws-cdk-lib";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  invokeBedrock,
  // 他のリソース
});

// Define the backend stack
backend.addOutput({
  custom: {
    invokeBedrockFunctionName:
      backend.invokeBedrock.resources.lambda.functionName,
  },
});

// Lambda function permissions
const bedrockStatement = new iam.PolicyStatement({
  actions: ["bedrock:*"],
  resources: ["*"],
});
backend.invokeBedrock.resources.lambda.addToRolePolicy(bedrockStatement);

const { cfnUserPool } = backend.auth.resources.cfnResources;
// an empty array denotes "email" and "phone_number" cannot be used as a username
cfnUserPool.usernameAttributes = [];
