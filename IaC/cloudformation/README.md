# CloudFormation for apps.test.com

このディレクトリには CloudFront と ACM 証明書のための CloudFormation テンプレートが含まれます。

ファイル:

- `acm-us-east-1.yaml` - ACM 証明書を us-east-1 に作成するテンプレート。DNS 検証用のレコード情報を出力するので、手動で Route53 に CNAME を作成して証明書を発行してください。

- `cloudfront-ap-northeast-1.yaml` - ap-northeast-1 にデプロイする CloudFront Distribution のテンプレート。ACM 証明書の ARN をパラメータに渡して使用します。Route53 のレコードは含めていないため、手動で A (ALIAS) レコードを作成してください。

前提:
- ACM 証明書は CloudFront 用に必ず us-east-1 で作成する必要があります。
- Route53 の DNS 設定は手動で行います（テンプレートでは作成しない）。

手順:

1. us-east-1 に `acm-us-east-1.yaml` をデプロイ
   - デプロイ後、スタックの出力に `ValidationRecordName` / `ValidationRecordType` / `ValidationRecordValue` が表示される。

2. Route53 に手動で CNAME レコードを作成して証明書を検証
   - レコード名: スタック出力 `ValidationRecordName`
   - 値: スタック出力 `ValidationRecordValue`
   - TTL: 300
   - 検証が完了するまで待つ（通常数分）。ACM の状態が ISSUED になるのを確認。

3. 証明書 ARN を控える（スタック出力 `CertificateArn`）

4. ap-northeast-1 に `cloudfront-ap-northeast-1.yaml` をデプロイ
    - デプロイ時にパラメータ `CertificateArn` に上記の ARN を渡す。
    - `OriginAHost` と `OriginBHost` は必要に応じて変更してください（デフォルトは `AAAA.amplifyapp.com` と `BBBB.amplifyapp.com`）。
       - 本テンプレートのルーティング:
          - パス `/a/*` -> `OriginAHost` (AAAA)
          - パス `/b/*` -> `OriginBHost` (BBBB)
          - それ以外（ルート `/` 等）は `OriginAHost` (AAAA) にルーティングされます（Default）。

5. スタック出力 `DistributionDomainName` を取得し、Route53 の A (ALIAS) レコードを作成して `apps.test.com` を CloudFront に向ける

注意点:
- Amplify の管理する CloudFront は直接編集される可能性があるため、Amplify 配布をオリジンとして CloudFront を作成する方法が安全です。
- `/a/*` と `/b/*` のプレフィックスは CloudFront Function によりオリジンへ渡す前に除去しています（それぞれ `StripAFunction` / `StripBFunction`）。
   - 例: `/a/foo` -> Function が `/foo` に書き換えて OriginA に渡す。Origin 側はルート前提でビルドしてください。
   - デフォルトの挙動は `OriginB`（BBBB）へルーティングされます。A をルート前提で使う場合は CloudFront Function を調整してください。

トラブルシューティング:
- 証明書の検証が通らない場合は、CNAME が正しく設定されているか、TTL を待ったか確認してください。
- ブラウザでリソースが読み込めない場合は、A/B の静的ファイルのパスに `/a` または `/b` の影響が残っていないか確認してください。必要なら各アプリを basePath なしでビルドするか、CloudFront Function の書き換えロジックを調整してください。

## Route53 に手動で CNAME を作成して ACM 証明書を検証する具体手順

以下は `acm-us-east-1.yaml` を実行して得られる出力（`ValidationRecordName` / `ValidationRecordType` / `ValidationRecordValue`）を使って、Route53 に CNAME レコードを手動で登録する手順です。Windows (PowerShell) と AWS CLI の例を両方示します。

前提:
- `acm-us-east-1.yaml` スタックを us-east-1 で作成済みで、スタック出力に下記があること:
   - `ValidationRecordName`（例: `_abc.apps.test.com.`）
   - `ValidationRecordType`（通常は `CNAME`）
   - `ValidationRecordValue`（例: `_xyz.acm-validations.aws.`）
   - `CertificateArn`（後で CloudFront スタックに渡します）
- Route53 に対象ドメインを管理している Hosted Zone が存在し、Hosted Zone ID が分かっていること。


### 1) CloudFormation の出力を確認する（コンソール）

1. AWS マネジメントコンソールにログインし、CloudFormation を開く（リージョン: US East (N. Virginia) - us-east-1）。
2. `acm-us-east-1` スタック（デプロイ時に指定したスタック名）を選択。
3. 「Outputs」タブを開き、`ValidationRecordName` と `ValidationRecordValue` を確認してコピーする。

### 2) Route53 コンソールで手動登録する手順（コンソールのみ）

1. AWS マネジメントコンソールで Route53 を開き、左メニューの「Hosted zones」を選択。
2. 対象の Hosted Zone（例: `test.com`）をクリックして開く。
3. 「Create record」または「レコードの作成」ボタンをクリック。
4. 「Record name」欄に CloudFormation の `ValidationRecordName` を貼り付けます（コンソールはホストゾーン名を補完するため、表示が重複しても問題ありません）。
5. 「Record type」ドロップダウンで `CNAME` を選択。
6. 「Value」欄に CloudFormation の `ValidationRecordValue` を貼り付け。
7. TTL を `300` に設定（任意）して「Create records」ボタンで保存。

### 3) ACM コンソールで証明書の発行状態を確認（コンソール）

1. AWS マネジメントコンソールで Certificate Manager (ACM) を開き、リージョンを US East (N. Virginia) - us-east-1 に切り替える。
2. 作成した証明書（`apps.test.com`）を一覧から選択。
3. 「Status」欄が `ISSUED` になっているか確認する。`PENDING_VALIDATION` の場合は DNS レコードがまだ反映されていないので、しばらく待ってから再確認してください。
4. 証明書が `ISSUED` になったら、詳細画面から `Certificate ARN` をコピーして、CloudFront スタックデプロイ時に使用します。

### 4) 発行後の次の作業（コンソール）

1. ACM 証明書が `ISSUED` になったら、CloudFormation の `cloudfront-ap-northeast-1.yaml` を ap-northeast-1 にデプロイする際、パラメータ `CertificateArn` にコピーした ARN を貼り付ける。
2. CloudFront スタックのデプロイ完了後、CloudFormation のスタック出力 `DistributionDomainName` をコピーする。
3. Route53 コンソール（Hosted Zone）で新しい A (ALIAS) レコードを作成し、Name に `apps.test.com` を指定、Alias ターゲットに CloudFront の `DistributionDomainName` を選択して保存。

---
上記をコンソール上のみで行う手順に書き換えました。CLI での手順を削除しています。*** End Patch

### よくあるトラブルと対処

- CNAME 名にホストゾーン名が重複する場合：CloudFormation 出力の値をそのまま使ってください。Route53 のコンソールは自動でホストゾーン名を補完するので、コピーした値に注意してください（末尾のドットは問題になりません）。
- Validation が長時間 `PENDING_VALIDATION` のまま：CNAME の TTL と DNS プロパゲーションを確認、Hosted Zone の環境（別アカウントにある等）を確認してください。

---
追加してほしいフォーマットのコマンドや自動化スクリプトがあれば教えてください。必要ならこの手順を `scripts/` に PowerShell スクリプトとして追加できます。
