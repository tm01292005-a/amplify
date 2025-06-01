import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { appConfig } from "../src/config";

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // OpenAPI定義の読み込み
    const openApiSpec = fs.readFileSync(
      path.join(__dirname, "..", "..", "..", "docs", "openapi", "openapi.yaml"),
      "utf-8"
    );

    // YAMLをJSONに変換
    const openApiJson = yaml.load(openApiSpec) as any;

    // API Gatewayの作成
    const api = new apigateway.RestApi(this, "MyApi", {
      restApiName: appConfig.apiGatewayName,
      deployOptions: {
        stageName: "prod",
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
      },
    });

    // APIキーの作成
    const apiKey = new apigateway.ApiKey(this, "ApiKey", {
      apiKeyName: "MyApiKey",
      enabled: true,
    });

    // 使用量プランの作成
    const usagePlan = new apigateway.UsagePlan(this, "UsagePlan", {
      name: "MyUsagePlan",
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        },
      ],
    });

    // APIキーを使用量プランに追加
    usagePlan.addApiKey(apiKey);

    // Cognitoオーソライザーの作成
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      "CognitoAuthorizer",
      {
        cognitoUserPools: [
          cognito.UserPool.fromUserPoolArn(
            this,
            "ImportedUserPool",
            appConfig.cognitoUserPoolArn
          ),
        ],
        authorizerName: "CognitoAuthorizer",
      }
    );

    // スキーマの$refを解決する関数
    function resolveSchema(schema: any, components: any): any {
      if (schema && schema.$ref) {
        const refPath = schema.$ref.replace(/^#\/?/, "").split("/");
        let resolved = components;
        for (const part of refPath.slice(1)) {
          resolved = resolved[part];
        }
        return resolved;
      }
      return schema;
    }

    // OpenAPI定義から各エンドポイントの設定を読み込み
    Object.entries(openApiJson.paths).forEach(
      ([path, pathItem]: [string, any]) => {
        const resource = api.root.addResource(path.replace(/^\//, ""));

        Object.entries(pathItem).forEach(
          ([method, methodItem]: [string, any]) => {
            // OPTIONSメソッドはCORSの設定で自動的に作成されるため、スキップ
            if (method === "parameters" || method === "options") return;

            const methodConfig = methodItem as any;
            const requestParameters: { [key: string]: boolean } = {};
            const requestModels: { [key: string]: apigateway.IModel } = {};
            const methodResponses: apigateway.MethodResponse[] = [];

            // リクエストパラメータの設定
            if (methodConfig.parameters) {
              methodConfig.parameters.forEach((param: any) => {
                if (param.in === "query") {
                  requestParameters[
                    `method.request.querystring.${param.name}`
                  ] = true;
                }
              });
            }

            // リクエストモデルの設定
            if (
              methodConfig.requestBody?.content?.["application/json"]?.schema
            ) {
              let schema =
                methodConfig.requestBody.content["application/json"].schema;
              schema = resolveSchema(schema, openApiJson.components);
              const model = api.addModel(
                `${path.replace(/\//g, "")}${method.toUpperCase()}Request`,
                {
                  contentType: "application/json",
                  modelName: `${path.replace(/\//g, "")}${method.toUpperCase()}Request`,
                  schema: schema,
                }
              );
              requestModels["application/json"] = model;
            }

            // レスポンスの設定
            if (methodConfig.responses) {
              Object.entries(methodConfig.responses).forEach(
                ([statusCode, response]: [string, any]) => {
                  const methodResponse: apigateway.MethodResponse = {
                    statusCode,
                    responseParameters: {
                      "method.response.header.Access-Control-Allow-Origin":
                        true,
                      "method.response.header.Access-Control-Allow-Headers":
                        true,
                      "method.response.header.Access-Control-Allow-Methods":
                        true,
                    },
                    responseModels: (response as any).content?.[
                      "application/json"
                    ]?.schema
                      ? {
                          "application/json": api.addModel(
                            `${path.replace(/\//g, "")}${method.toUpperCase()}${statusCode}Response`,
                            {
                              contentType: "application/json",
                              modelName: `${path.replace(/\//g, "")}${method.toUpperCase()}${statusCode}Response`,
                              schema: resolveSchema(
                                (response as any).content["application/json"]
                                  .schema,
                                openApiJson.components
                              ),
                            }
                          ),
                        }
                      : undefined,
                  };

                  methodResponses.push(methodResponse);
                }
              );
            }

            // メソッドの作成
            const methodResource = resource.addMethod(
              method.toUpperCase(),
              new apigateway.LambdaIntegration(
                cdk.aws_lambda.Function.fromFunctionName(
                  this,
                  `${path.replace(/\//g, "")}${method.toUpperCase()}Function`,
                  path.replace(/^\//, "")
                )
              ),
              {
                authorizer: authorizer,
                authorizationType: apigateway.AuthorizationType.COGNITO,
                apiKeyRequired: true,
                requestParameters,
                requestModels:
                  Object.keys(requestModels).length > 0
                    ? requestModels
                    : undefined,
                methodResponses:
                  methodResponses.length > 0
                    ? methodResponses
                    : [
                        {
                          statusCode: "200",
                          responseParameters: {
                            "method.response.header.Access-Control-Allow-Origin":
                              true,
                            "method.response.header.Access-Control-Allow-Headers":
                              true,
                            "method.response.header.Access-Control-Allow-Methods":
                              true,
                          },
                        },
                      ],
              }
            );
          }
        );

        // CORSの設定
        const allowedMethods = Object.keys(pathItem)
          .filter((m) => m !== "parameters" && m !== "options")
          .map((m) => m.toUpperCase());

        // HEADとOPTIONSメソッドを追加
        if (!allowedMethods.includes("HEAD")) {
          allowedMethods.push("HEAD");
        }
        if (!allowedMethods.includes("OPTIONS")) {
          allowedMethods.push("OPTIONS");
        }

        const corsOptions: apigateway.CorsOptions = {
          allowOrigins: apigateway.Cors.ALL_ORIGINS,
          allowMethods: allowedMethods,
          allowHeaders: ["Content-Type", "Authorization", "x-api-key"],
        };
        resource.addCorsPreflight(corsOptions);
      }
    );

    // 出力の設定
    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: `https://${api.restApiId}.execute-api.${this.region}.amazonaws.com/prod/`,
      description: "API Gateway endpoint URL",
    });
  }
}
