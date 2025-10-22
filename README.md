## 概要
本リポジトリは Next.js (App Router) + AWS (Amplify, Lambda, S3, Redshift Data API) を用いた管理系 Web アプリです。主機能として Excel (.xlsx) をアップロードし、Redshift テーブルへ差分自動適用 (INSERT / UPDATE / DELETE) する「Excel → Redshift インポート機能」を提供します。Excel 内に operation 列は存在せず、DB 現行スナップショットとの比較で差分判定を行います。

## 目次
1. 機能ハイライト
2. アーキテクチャ概要
3. インポート処理ワークフロー
4. 差分アルゴリズム (operation 列なし)
5. トランザクション適用順序
6. バリデーションルール
7. 利用手順 (オペレーション)
8. 開発環境セットアップ
9. テスト (Unit / Integration / E2E)
10. ディレクトリ構成 (主要箇所)
11. 環境変数 / 依存リソース
12. メトリクス / ログ (現状と計画)
13. Backlog / 今後の改善
14. Amplify 基本操作チートシート (既存内容)

## 1. 機能ハイライト
- Excel スナップショットを基にした差分自動判定 (operation 列不要)
- 1,000 行 or 5MB 制約超過は即時 FAILED
- 重複主キー / 日付逆転 / 期間重複バリデーション
- 主キー変更は Delete + Insert として自然吸収
- Redshift Data API による 1 トランザクション (DELETE→UPDATE→INSERT) 適用
- 完全失敗のみ (部分成功なし / ロールバック保証)
- ジョブ履歴参照 & UI ポーリング表示

## 2. アーキテクチャ概要
```
User -> Next.js Page -> (Template Download / Presign / Execute / Jobs API)
                                      |        |         |
                                      |        |         +-> Lambda Invoke (Async)
                                      |        |                |
                                      |        +-> S3 (Excel 原本保管)
                                      +-> Redshift (既存スナップショット read)

Lambda: S3 取得 → parse(exceljs) → validate(Zod) → computeDiff → staging CSV → COPY → DELETE/UPDATE/INSERT → import_jobs 更新
```

## 3. インポート処理ワークフロー
1. ユーザーがテンプレート Excel をダウンロード (現行データ埋込 + README シート)
2. Excel 上で行追加 / 編集 / 行削除 / 主キー変更
3. フロントから署名 URL 取得 → S3 に PUT
4. 実行 API に jobId を POST → Lambda 非同期起動
5. Lambda が Excel を取得しバリデーション & 差分計算 & CSV 生成
6. COPY で staging へロード後、DELETE→UPDATE→INSERT を 1 トランザクションで実行
7. import_jobs ステータス SUCCEEDED / FAILED を更新
8. フロントがポーリングして結果を表示 (件数 / ステータス)

## 4. 差分アルゴリズム (operation 列なし)
- 現行集合: Redshift から主キー (最大 1,000 行) を全取得
- 新集合: Excel 行
- Insert: 新 - 現行
- Delete: 現行 - 新
- Update: 主キー一致 & 非キー列 (price, currency, is_active, description, tenant_id など) に差異あり
- NoOp: 主キー一致 & 差異なし
- 主キー変更は Delete + Insert に自然分解

## 5. トランザクション適用順序
DELETE → UPDATE → INSERT の順で実行。理由:
1. 不要行を先に除去し一意制約や期間制約の衝突余地を減らす
2. UPDATE で既存キーを変更せず列のみ更新
3. 最後に新規行を挿入し整合性を完成

全処理が 1 つの Redshift トランザクション内 (BeginTransaction / CommitTransaction) で行われ、途中失敗時は Rollback。空差分 (すべて 0 件) でもトランザクションは発行され、整合性ログを残します。

## 6. バリデーションルール
| 種別 | 内容 |
|------|------|
| 行数上限 | 1,000 行超で失敗 |
| ファイルサイズ | 5MB 超で失敗 (Lambda 取得後判定) |
| 重複主キー | (product_code, effective_from, effective_to) 重複で失敗 |
| 期間重複 | 同 product_code で日付範囲が重なると失敗 |
| 日付逆転 | effective_from > effective_to で失敗 |
| 型/スキーマ | 不正値 (日付形式, 数値, 通貨, boolean) で失敗 |
| 主キー変更 | Delete + Insert として扱う (エラーではない) |
| 差分整合 | diff 集計値検証 (内部チェック) |

## 7. 利用手順 (オペレーション)
1. 管理画面にログイン
2. 「価格スケジュールインポート」ページへ遷移
3. テンプレート Excel をダウンロード
4. Excel を編集 (削除=行削除)
5. 署名 URL 取得 → ファイルをアップロード (ドラッグ & ドロップ or ファイル選択)
6. 実行ボタン押下 → ジョブ開始 (トースト表示)
7. ポーリングで SUCCEEDED / FAILED を確認
8. 必要なら再度テンプレートを取得し再アップロード

## 8. 開発環境セットアップ
Node.js 20.x 推奨。
```
npm install
npm run dev
```
Amplify CLI 初期化は既存環境に合わせて行ってください (後述チートシート参照)。

## 9. テスト
| 種別 | ツール | コマンド | 備考 |
|------|--------|----------|------|
| Unit | Vitest | `npm run test:unit` | Lambda ロジック (parse/validate/diff/apply) |
| Integration | Vitest (handler) | `npm run test:unit` | モック Redshift Data API |
| E2E | Playwright | `npm run test:e2e` | UI フロー (ネットワークモック) |

ウォッチモード:
```
npm run test:unit:watch
```

## 10. ディレクトリ構成 (抜粋)
```
app/
  dashboard/import/price-schedule/ ... UI ページ
  api/import/price-schedule/...      API ルート群 (template / execute / jobs)
lambda/
  price-schedule-import/             Lambda ソース (diff / redshift / validation)
design/excel-import-redshift-spec.md  仕様書 (v1.1)
tests/e2e/                           Playwright E2E
```

## 11. 環境変数 / 依存リソース (例)
| 変数 | 用途 | 備考 |
|------|------|------|
| PRICE_SCHEDULE_BUCKET | Excel 原本 & staging CSV 保管 S3 バケット | presign API で利用 |
| IMPORT_EXECUTOR_FUNCTION_NAME | 非同期起動する Lambda 名 | execute API |
| REDSHIFT_WORKGROUP / CLUSTER IDENTIFIERS | Redshift Data API 接続 | インフラ設定依存 |
| REDSHIFT_DATABASE | 対象 DB 名 |  |
| REDSHIFT_SECRET_ARN | 認証情報格納 Secret ARN | Data API 用 |
| REDSHIFT_COPY_ROLE_ARN / REDSHIFT_COPY_CREDENTIALS | Redshift COPY 用の IAM ロールまたは一時認証情報 | どちらか一方を設定 |
| REDSHIFT_COPY_OPTIONS | COPY 追加オプション | 任意 (例: `COMPUPDATE OFF`) |

※ 実際のキー名称は SAM/Amplify 設定に従い調整してください。

## 12. メトリクス / ログ (現状と計画)
- 現状: CloudWatch へ基本ログ (開始/完了/件数)。
- 予定 (Task 0021):
  - 構造化 JSON ログ (event=import.start/import.diff/import.apply/import.done)
  - 所要時間・行数 (insert/update/delete/total) 埋め込み
  - 失敗時 stack trace + correlation id

## 13. Backlog / 改善予定
- 重複アップロード警告 (checksum 利用)
- 部分成功 + エラー CSV
- COPY オプション明示化 (DELIMITER, QUOTE, ESCAPE)
- クエリ完全パラメータ化
- 監査ログ Athena 最適化

## 14. Amplify 基本操作チートシート
以下は従来 README の Amplify 手順を整理したものです。

### 初期設定
```
npm install -g @aws-amplify/cli
amplify configure
# 既存 IAM ユーザーの accessKeyId / secretAccessKey を入力 (新規ユーザー作成不要)
```

開発依存追加:
```
npm add --save-dev @aws-amplify/backend@latest @aws-amplify/backend-cli@latest
```

### 新規プロジェクト作成
```
git init
npm create amplify@latest
# Ok to proceed? (y) -> y
```

### 既存プロジェクトからの開始
```
amplify init --app <レポジトリURL>
# 例: amplify init --app https://github.com/xxxx/xxxxx.git
# Do you want to continue with Amplify Gen 1? -> no
```

### サンドボックス
```
npx ampx sandbox
npx ampx sandbox secret list
```

### 認証(Cognito) 追加
```
npm install @aws-amplify/ui-react
amplify add auth
amplify push
```

### Lambda 追加 (型定義)
```
npm add --save-dev @types/aws-lambda
```

### API Gateway 追加
```
amplify add api
```

### 参考 URL
https://qiita.com/makishy/items/6072d4e8bebea0f1604c

---
## ライセンス
本リポジトリ内コードは LICENSE (存在する場合) に従います。未記載の場合は社内利用前提の内部コードです。

## 開発ステータス
Task 0020 (README 更新) まで完了。次はメトリクス/ロギング強化 (0021)。
amplify add api

## CloudFront 署名付き URL (Amplify 環境での運用メモ)

本リポジトリでは CloudFront 経由での署名付き URL をサーバー側で生成し、クライアントへ返す API を用意しています。

実装箇所:
- `app/api/cloudfront-sign/route.ts` - Secrets Manager から秘密鍵を取得し CloudFront の署名付き URL を返す API

必要な環境変数 / 設定:
- `CF_PRIVATE_KEY_SECRET_NAME` - Secrets Manager に保存した秘密鍵シークレット名 (秘密鍵は PEM 文字列で保存)
- `CF_PRIVATE_KEY` - （オプション）Secrets Manager を使わない場合のフォールバック用秘密鍵（本番では非推奨）
- `CF_KEY_PAIR_ID` - CloudFront に登録した Key Pair ID
- `AWS_REGION` - Secrets Manager を格納したリージョン

IAM / Amplify 設定:
- Amplify がデプロイ時/実行時に Secrets Manager から秘密鍵を取得できるよう、実行ロールに以下のようなポリシーを付与してください:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": ["arn:aws:secretsmanager:<REGION>:<ACCOUNT_ID>:secret:<SECRET_NAME>*"]
    }
  ]
}
```

使い方（簡単）:
1. Secrets Manager に秘密鍵（PEM 文字列）を保存。名前を `CF_PRIVATE_KEY_SECRET_NAME` として Amplify の環境変数に設定する。
2. Amplify コンソールで環境変数 `CF_KEY_PAIR_ID` と `CF_PRIVATE_KEY_SECRET_NAME` を設定。
3. フロントから `/api/cloudfront-sign` に POST で { url: "https://<distro>.cloudfront.net/path" } を投げると署名付き URL が返る。

注意:
- 秘密鍵はクライアントに渡さない。サーバー側で署名のみ実行する。  
- 短期キャッシュ (route.ts 内の CACHE_TTL_MS) を設けて Secrets Manager 呼び出しを節約している。
- Key のローテーションや期限切れ対応を運用フローに含める。
