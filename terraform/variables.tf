// 環境変数定義

variable "region" {
  description = "AWS region"
  default     = "ap-northeast-1"
}

variable "lambda_exec_role_name" {
  description = "Lambda実行ロール名"
  default     = "lambda_exec_role"
}

variable "lambda_function_sample_name" {
  description = "sample Lambda関数名"
  default     = "sample"
}

variable "api_gateway_name" {
  description = "API Gateway名"
  default     = "sample-api"
}

variable "aws_s3_bucket_name" {
  description = "S3バケット名"
  default     = "lambda-buket123"
}

variable "lambda_functions" {
  description = "Lambda関数の一覧"
  type = map(object({
    handler : string
    s3_key  : string
    env     : map(string)
    method  : string
  }))
  default = {
    sample = {
      handler = "index.handler"
      s3_key  = "sample/index.zip"
      env     = { EXAMPLE_KEY = "example_value" }
      method  = "POST"
    }
    sample2 = {
      handler = "index.handler"
      s3_key  = "sample2/index.zip"
      env     = { EXAMPLE_KEY = "example_value" }
      method  = "GET"
    }
    sample3 = {
      handler = "index.handler"
      s3_key  = "sample3/index.zip"
      env     = { EXAMPLE_KEY = "example_value3" }
      method  = "GET"
    }
  }
}