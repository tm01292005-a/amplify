// API Gatewayリソース・メソッド・統合・権限・デプロイメント・ステージ定義

// --- API Gateway REST API定義 ---
resource "aws_api_gateway_rest_api" "api" {
  name = var.api_gateway_name
}

// --- Lambda関数ごとにAPI Gatewayリソースを作成 ---
resource "aws_api_gateway_resource" "lambda" {
  for_each   = var.lambda_functions
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = each.key
}

// --- Lambda関数ごとにAPI Gatewayメソッドを作成 ---
resource "aws_api_gateway_method" "lambda" {
  for_each   = var.lambda_functions
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.lambda[each.key].id
  http_method   = each.value.method
  authorization = "NONE"
}

// --- Lambda関数ごとにAPI Gateway統合設定を作成 ---
resource "aws_api_gateway_integration" "lambda" {
  for_each   = var.lambda_functions
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.lambda[each.key].id
  http_method = aws_api_gateway_method.lambda[each.key].http_method
  integration_http_method = "POST"
  type        = "AWS_PROXY"
  uri         = aws_lambda_function.functions[each.key].invoke_arn
}

// --- API GatewayからLambdaを呼び出すための権限付与 ---
resource "aws_lambda_permission" "apigw_lambda" {
  for_each      = var.lambda_functions
  statement_id  = "AllowAPIGatewayInvoke${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.functions[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

// --- API Gatewayのデプロイメント作成 ---
resource "aws_api_gateway_deployment" "deployment" {
  depends_on = [
    aws_api_gateway_integration.lambda
  ]
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
