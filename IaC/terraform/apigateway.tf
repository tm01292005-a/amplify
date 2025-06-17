// API Gatewayリソース・メソッド・統合・権限・デプロイメント・ステージ定義

// --- OpenAPI定義の読み込みと解析 ---
locals {
  openapi_yaml = yamldecode(file("${path.module}/../docs/openapi/openapi.yaml"))
  
  // スキーマの$refを解決する関数
  resolve_schema = {
    schema = local.openapi_yaml.components.schemas
    components = local.openapi_yaml.components
  }

  // リクエストモデルの設定
  request_models = {
    for path, path_item in local.openapi_yaml.paths :
    path => {
      for method, method_item in path_item :
      method => (
        (
          lookup(method_item, "requestBody", null) != null &&
          lookup(lookup(method_item, "requestBody", {}), "content", null) != null
        )
        ? {
            for content_type, content_item in lookup(lookup(method_item, "requestBody", {}), "content", {}) :
            content_type => content_item.schema
          }
        : {}
      )
      if method != "parameters"
    }
  }

  // レスポンスモデルの設定
  response_models = {
    for path, path_item in local.openapi_yaml.paths :
    path => {
      for method, method_item in path_item :
      method => (
        (
          lookup(method_item, "responses", null) != null
        )
        ? { for content_type, content_item in lookup(method_item.responses, "content", {}) : content_type => content_item.schema }
        : {}
      )
      if method != "parameters"
    }
  }
}

// --- Cognitoオーソライザーのリソース追加 ---
resource "aws_api_gateway_authorizer" "cognito" {
  name                    = "CognitoAuthorizer"
  rest_api_id             = aws_api_gateway_rest_api.api.id
  type                    = "COGNITO_USER_POOLS"
  provider_arns           = ["arn:aws:cognito-idp:ap-northeast-1:718101782941:userpool/ap-northeast-1_uBkpIV0Bb"]
}

// --- API Gatewayのステージ作成（prod） ---
resource "aws_api_gateway_stage" "prod" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  deployment_id = aws_api_gateway_deployment.deployment.id
  stage_name    = "prod"
}

// --- API Gatewayのデプロイメント作成 ---
resource "aws_api_gateway_deployment" "deployment" {
  triggers = {
    redeployment = filesha1("${path.module}/../docs/openapi/openapi.yaml")
  }
  rest_api_id = aws_api_gateway_rest_api.api.id

  lifecycle {
    create_before_destroy = true
  }
}

// --- API Gateway REST API定義 ---
resource "aws_api_gateway_rest_api" "api" {
  name = var.api_gateway_name
  body = jsonencode({
    openapi = local.openapi_yaml.openapi
    info    = local.openapi_yaml.info
    paths   = {
      for path, path_item in local.openapi_yaml.paths :
      path => {
        for method, method_item in path_item :
        method => merge(
          method_item,
          {
            security = [
              {
                CognitoAuthorizer = [],
                ApiKeyAuth = []
              }
            ],
            x-amazon-apigateway-integration = {
              type = "AWS_PROXY",
              uri = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.functions[replace(path, "/", "")].arn}/invocations",
              httpMethod = "POST",
              passthroughBehavior = "WHEN_NO_MATCH",
              contentHandling = "CONVERT_TO_TEXT"
            },
            x-amazon-apigateway-authorizer = {
              type = "cognito_user_pools"
              providerARNs = ["arn:aws:cognito-idp:ap-northeast-1:718101782941:userpool/ap-northeast-1_uBkpIV0Bb"]
              identitySource = "method.request.header.Authorization"
            }
          }
        ) if method != "parameters"
      }
    }
    components = {
      schemas = local.openapi_yaml.components.schemas
      securitySchemes = {
        CognitoAuthorizer = {
          type = "apiKey"
          name = "Authorization"
          in   = "header"
        },
        ApiKeyAuth = {
          type = "apiKey"
          name = "x-api-key"
          in   = "header"
        }
      }
    }
  })
}

// --- Lambda実行権限のみTerraformで管理 ---
resource "aws_lambda_permission" "apigw_lambda" {
  for_each      = var.lambda_functions
  statement_id  = "AllowAPIGatewayInvoke${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.functions[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

// --- 各Lambda関数のAPI GatewayエンドポイントURLを出力 ---
output "invoke_url" {
  value = { for k, v in var.lambda_functions :
    k => "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.region}.amazonaws.com/prod/${k}"
  }
}
