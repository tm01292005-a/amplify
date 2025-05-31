// lambda.tf
// Lambda実行ロールとLambda関数定義

// --- Lambda実行ロール定義 ---
resource "aws_iam_role" "lambda_exec" {
  name = var.lambda_exec_role_name
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

// --- Lambda実行ロールにポリシーをアタッチ ---
resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

// --- Lambda関数定義 ---
resource "aws_lambda_function" "functions" {
  for_each      = var.lambda_functions
  function_name = each.key
  handler       = each.value.handler
  runtime       = "nodejs18.x"
  s3_bucket     = var.aws_s3_bucket_name
  s3_key        = each.value.s3_key
  source_code_hash = data.aws_s3_object.package[each.key].etag
  role          = aws_iam_role.lambda_exec.arn
  timeout       = 900
  environment {
    variables = each.value.env
  }
}

// --- Lambda関数ビルド ---
resource "null_resource" "lambda_build" {
  for_each = var.lambda_functions

  triggers = {
    code_diff = join("", [
      for file in fileset("${path.module}/../lambda/${each.key}", "{*.ts,package*.json}")
      : filebase64("${path.module}/../lambda/${each.key}/${file}")
    ])
  }

  provisioner "local-exec" {
    command = "cd ${path.module}/../lambda/${each.key} && npm install"
  }
  provisioner "local-exec" {
    command = "cd ${path.module}/../lambda/${each.key} && npm run build"
  }
  provisioner "local-exec" {
    command = "aws s3 cp ${path.module}/../lambda/${each.key}/dist/index.zip s3://${var.aws_s3_bucket_name}/${each.key}/index.zip"
  }
  provisioner "local-exec" {
    command = "openssl dgst -sha256 -binary ${path.module}/../lambda/${each.key}/dist/index.zip | openssl enc -base64 | tr -d '\n' > ${path.module}/../lambda/${each.key}/dist/index.zip.base64sha256"
  }
  provisioner "local-exec" {
    command = "aws s3 cp ${path.module}/../lambda/${each.key}/dist/index.zip.base64sha256 s3://${var.aws_s3_bucket_name}/${each.key}/index.zip.base64sha256.txt --content-type 'text/plain'"
  }
}
resource "aws_s3_bucket_server_side_encryption_configuration" "lambda_assets" {
  bucket = var.aws_s3_bucket_name

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

// --- S3バケット（lambda_assets）に対するパブリックアクセス制御の設定 ---
resource "aws_s3_bucket_public_access_block" "lambda_assets" {
  bucket = var.aws_s3_bucket_name

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

// S3バケットにZIP化したLambda関数を配置
data "aws_s3_object" "package" {
  for_each = var.lambda_functions
  depends_on = [null_resource.lambda_build]
  bucket = var.aws_s3_bucket_name
  key    = "${each.key}/index.zip"
}
data "aws_s3_object" "package_hash" {
  for_each = var.lambda_functions
  depends_on = [null_resource.lambda_build]
  bucket = var.aws_s3_bucket_name
  key    = "${each.key}/index.zip.base64sha256.txt"
}