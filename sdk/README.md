# AWS SDK Infrastructure

このプロジェクトは、Terraformの設定をAWS SDKを使用して実装したものです。

## 前提条件

- Node.js 18.x以上
- AWS CLIがインストールされ、適切な認証情報が設定されていること
- TypeScript 4.x以上

## セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. 環境変数の設定:
以下の環境変数を設定してください：
- AWS_REGION: AWSリージョン（デフォルト: ap-northeast-1）
- AWS_S3_BUCKET_NAME: S3バケット名（デフォルト: lambda-buket123）
- LAMBDA_EXEC_ROLE_NAME: Lambda実行ロール名（デフォルト: lambda_exec_role）
- API_GATEWAY_NAME: API Gateway名（デフォルト: sample-api）
- COGNITO_USER_POOL_ARN: CognitoユーザープールARN

## 使用方法

1. Lambda関数のビルド:
```bash
cd lambda/<function-name>
npm install
npm run build
```

2. インフラストラクチャのデプロイ:
```bash
npm start
```

## 実装されている機能

- Lambda関数の作成と設定
- IAMロールの作成とポリシーのアタッチ
- S3バケットの暗号化とパブリックアクセス制御
- API Gatewayの作成と設定
- Cognitoオーソライザーの設定

## 注意事項

- このコードを実行する前に、AWS CLIの認証情報が適切に設定されていることを確認してください。
- 既存のリソースがある場合は、先に削除する必要があります。
- 本番環境で使用する前に、セキュリティ設定を適切に確認してください。 