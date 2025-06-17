# Copilot 利用ガイド

このプロジェクトは、AWS Lambda・API Gateway・Cognito・S3 などを IaC（CDK/Terraform）で管理し、
Next.js（app ディレクトリ構成）でフロントエンドを構築しています。  
Copilot を利用する際は、以下のルール・注意点を守ってください。

---

## 1. コーディング規約

- **TypeScript/JavaScript**: 型安全を意識し、`any`の多用を避ける。
- **インポートパス**: `@/app/...` などのエイリアスを優先して利用。
- **React**: 関数コンポーネントは`export default function`で書く。
- **AWSリソース**: 既存のCDK/Terraform構成に準拠し、リソース名・環境変数は`appConfig`や`outputs`を参照。

### 1. 共通

- **言語**: TypeScript（主に .ts/.tsx）、一部JavaScript（.js/.mjs）
- **インデント**: スペース 4
- **セミコロン**: 必須
- **クォート**: シングルクォート（'）を推奨
- **ファイル命名**: ケバブケース（例: `sample-file.ts`）、Reactコンポーネントはパスカルケース（例: `MyComponent.tsx`）

### 2. TypeScript/React

- **型定義**: 可能な限り型を明示。`any`は極力使わない。
- **関数コンポーネント**: `export default function ComponentName() {}` 形式を推奨
- **Propsの型**: 必ず型定義（例: `type Props = { ... }`）
- **Hooks**: React公式の命名規則（`useXxx`）を守る
- **import順序**: 外部→内部→相対パスの順
- **ファイル分割**: 1ファイル1コンポーネント/1関数を基本とする

### 3. Next.js

- **appディレクトリ構成**: ページ/レイアウト/コンポーネントは`app/`配下に配置
- **"use client"**: クライアントコンポーネントはファイル先頭に記載
- **環境変数**: `process.env.NEXT_PUBLIC_...` を利用
- **API呼び出し**: fetchはasync/awaitで記述し、エラーハンドリングを行う

### 4. AWSリソース（CDK/Terraform/Lambda）

- **CDK/SDK**: 既存の型・変数（例: [`AppConfig`](sdk/src/config.ts)）を利用
- **Terraform**: 変数・リソース名は`variables.tf`や`lambda.tf`の命名規則に従う
- **Lambda**: handlerは`index.ts`または`index.mjs`、エクスポートは`handler`名で統一
- **環境変数**: `env`オブジェクトで明示的に渡す
- **S3バケット名等**: ハードコーディングせず、設定ファイルや環境変数から取得

### 5. UI/スタイル

- **Tailwind CSS**: ユーティリティクラスを優先。カスタムCSSは`global.css`等にまとめる
- **アイコン**: Heroiconsや公式推奨パッケージを利用
- **アクセシビリティ**: aria属性やラベル付与を意識

### 6. その他

- **コメント**: 必要に応じて日本語で簡潔に記載
- **コミットメッセージ**: 英語または日本語で要点を簡潔に
- **テスト**: 追加・修正時は必ずテストを実施

---

## 参考

- [app/lib/definitions.ts](app/lib/definitions.ts)
- [sdk/src/config.ts](sdk/src/config.ts)
- [lambda/README.md](lambda/README.md)
- [sdk/README.md](sdk/README.md)
- [tailwind.config.ts](tailwind.config.ts)

---

## 2. ディレクトリ構成の意図

- `app/` ... Next.js アプリ本体。UI・APIルート・ページを配置。
- `lambda/` ... Lambda関数のソース。各関数ごとにディレクトリ分割。
- `sdk/` ... AWSリソースのCDKスタック（TypeScript）。
- `terraform/` ... TerraformによるAWSリソース管理（主に既存互換用）。
- `public/` ... 静的ファイル。
- `docs/` ... OpenAPI仕様や設計資料。

---

## 3. AWSリソース管理

- **新規Lambda追加**:

  1. `lambda/<name>/`にTypeScriptで実装
  2. `sdk/src/config.ts`の`lambdaFunctions`に設定を追加
  3. 必要に応じて`terraform/lambda.tf`も修正（Terraform利用時）

- **API Gatewayエンドポイント追加**:
  1. `docs/openapi/openapi.yaml`にパス・スキーマを追加
  2. `sdk/lib/api-gateway-stack.ts`で自動反映される設計
  3. Cognito認証・APIキー要否はOpenAPI/スタック設定に従う

---

## 4. Amplify/Cognito

- Amplifyの設定は`amplify_outputs.json`経由でNext.jsに渡される
- 認証は`aws-amplify`パッケージで実装（例: `signOut`/`useAuthenticator`）

---

## 5. 開発・デプロイ手順

- **Lambdaローカルビルド**:
  ```bash
  cd lambda/<function-name>
  npm install
  npm run build
  ```
- **CDKデプロイ**:
  ```bash
  cd sdk
  npm run build
  npm start
  ```
- **Terraformデプロイ（旧手順）**:
  ```bash
  cd terraform
  terraform init
  terraform plan
  terraform apply
  ```

---

## 6. Copilotへの指示例

- 「Lambda関数を追加したい」→`sdk/src/config.ts`と`lambda/`を編集
- 「API Gatewayの新しいエンドポイントを作成」→`docs/openapi/openapi.yaml`を編集
- 「Cognito認証付きAPIを作りたい」→OpenAPIで`security`を指定
- 「UIからAPIを呼び出したい」→`process.env.NEXT_PUBLIC_API_BASE_URL`を利用

---

## 7. 注意事項

- **環境変数**は`.env`またはAmplify/CDK/terraform経由で管理
- **S3バケット名・ロール名**などは`appConfig`や`amplify_outputs.json`を参照
- **TerraformとCDKのリソース重複**に注意（どちらか一方で管理）
- **AWS CLI認証情報**が必要（`aws configure`済みであること）

---

## 8. 参考

- [sdk/README.md](sdk/README.md)
- [lambda/README.md](lambda/README.md)
- [terraform/](terraform/)
- [amplify/backend.ts](amplify/backend.ts)
