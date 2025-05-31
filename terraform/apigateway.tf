// API Gatewayリソース・メソッド・統合・権限・デプロイメント・ステージ定義

// --- API Gateway REST API定義 ---
resource "aws_api_gateway_rest_api" "api" {
  name = var.api_gateway_name
  body = file("${path.module}/../docs/openapi/openapi.yaml")
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

// --- Cognitoオーソライザーのリソース追加 ---
resource "aws_api_gateway_authorizer" "cognito" {
  name                    = "CognitoAuthorizer"
  rest_api_id             = aws_api_gateway_rest_api.api.id
  authorizer_uri          = null
  authorizer_credentials  = null
  type                    = "COGNITO_USER_POOLS"
  provider_arns           = ["arn:aws:cognito-idp:ap-northeast-1:718101782941:userpool/ap-northeast-1_uBkpIV0Bb"]
  identity_source         = "method.request.header.Authorization"
}

// --- API Gatewayのデプロイメント作成 ---
resource "aws_api_gateway_deployment" "deployment" {
  depends_on = [aws_api_gateway_rest_api.api]
  triggers = {
    redeployment = filesha1("${path.module}/../docs/openapi/openapi.yaml")
  }
  rest_api_id = aws_api_gateway_rest_api.api.id
}

// --- API Gatewayのステージ作成（prod） ---
resource "aws_api_gateway_stage" "prod" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  deployment_id = aws_api_gateway_deployment.deployment.id
  stage_name    = "prod"
}

// --- 各Lambda関数のAPI GatewayエンドポイントURLを出力 ---
output "invoke_url" {
  value = { for k, v in var.lambda_functions :
    k => "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.region}.amazonaws.com/prod/${k}"
  }
}
