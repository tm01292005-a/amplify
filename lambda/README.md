## Lambda
### 事前準備
- wsl2をインストール
- wsl2上にDockerをインストール
- wsl2上にnodeJS 20.xをインストール
  - curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  - sudo apt-get install -y nodejs
- wsl2上にaws cliをインストール
  - curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
  - unzip awscliv2.zip
  - sudo ./aws/install
  - aws --version
  - aws configure
- wsl2上にaws samをインストール
  - sudo apt-get update
  - sudo apt-get install unzip
  - curl -Lo aws-sam-cli-linux-x86_64.zip https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
  - unzip aws-sam-cli-linux-x86_64.zip
  - sudo ./install
  - sam --version
- wsl上にTerraformをインストール
  - sudo apt-get update && sudo apt-get install -y gnupg software-properties-common curl
  - sudo apt install zip
  - curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
  - echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
  - sudo apt-get update
  - sudo apt-get install terraform
  - terraform -version
- wsl上にtscをインストール
  - sudo apt-get install -y nodejs npm
  - sudo npm install -g typescript
  - tsc --version

### TSファイルローカルビルド方法 (WSL上で実行)
- cd lambda
- cd sample2
- npm install
- npm run build

### ローカル起動方法 (WSL上で実行)
###### 1. Lambdaを直接テストする場合(単体のLambdaを起動)
- cd lambda
- sam local invoke (Function Name) -t (template.yaml) -e (event.json)
  - 例: sam local invoke SampleFunction -t template.yaml -e ./sample/event.json

###### 2. API Gateway経由でテストする場合(複数のLambdaを起動)
- cd lambda
- sam local start-api

- 動作確認
  - GETの場合
    - curl -X GET http://127.0.0.1:3000/sample2?key1=value1
  - POSTの場合
    - curl -X POST http://127.0.0.1:3000/sample -H "Content-Type: application/json" -d ./lambda/sample/event.json

### AWSにデプロイ
#### 事前準備
- S3バケット(terraform管理 兼 Lambdaデプロイ用)

#### 手順(aws sdkでビルド・デプロイする手順)
- cd cdk
- npm run build
- npm run deploy

#### 旧手順(terraformでビルド・デプロイする手順)
- cd terraform
- terraform init
  - 初回のみ実施
- terraform plan
  - エラーがでないことと環境差分を確認
- terraform apply
  - "Enter a value:"で"yes"を入力

#### 旧手順(sam deployでビルド・デプロイする手順)
- sam build
- sam package --s3-bucket [BuketName] --output-template-file packaged.yaml
- sam deploy --template-file packaged.yaml --stack-name [your-stack-name] --capabilities CAPABILITY_IAM
