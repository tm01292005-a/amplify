// terraform.tfstateの設定
terraform {
  backend "s3" {
    bucket         = "lambda-buket123"
    key            = "terraform/terraform.tfstate"
    region         = "ap-northeast-1"
    encrypt        = true
  }
}

// AWSプロバイダー設定
provider "aws" {
  region = var.region
}
