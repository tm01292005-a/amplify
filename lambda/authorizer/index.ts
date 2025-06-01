// Lambdaオーソライザー（TypeScript/ESM）サンプル実装
import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from "aws-lambda";

export async function handler(
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> {
  // Authorizationヘッダーからトークン取得1
  const token = event.headers?.Authorization || event.headers?.authorization;

  // 簡易なトークン検証（本番ではJWT検証などを実装）
  if (token === "allow-token") {
    return generatePolicy("user", "Allow", event.methodArn);
  } else {
    return generatePolicy("user", "Deny", event.methodArn);
  }
}

function generatePolicy(
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string
): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context: {
      // 追加情報をここに
      user: principalId,
    },
  };
}
