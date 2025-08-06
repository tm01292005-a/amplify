# DatePicker テストケース

このドキュメントでは、react-datepickerを使用したDatePickerコンポーネントとそのデモ画面の単体テストケースについて説明します。

## 作成されたファイル

### 1. CustomDatePicker コンポーネント
- **ファイル**: `app/ui/date-picker.tsx`
- **説明**: react-datepickerをラップしたカスタムコンポーネント
- **機能**:
  - 基本的な日付選択
  - 時間選択（オプション）
  - 日付範囲制限（minDate, maxDate）
  - 無効化状態
  - カスタムスタイリング

### 2. DatePickerDemoPage
- **ファイル**: `app/date-picker-demo/page.tsx`
- **説明**: CustomDatePickerを使用したデモ画面
- **機能**:
  - 基本的なDatePicker
  - 期間選択（開始日・終了日）
  - 会議日時選択
  - 無効化されたDatePicker
  - 選択結果の表示

### 3. テストケース

#### CustomDatePicker のテスト
- **ファイル**: `app/__tests__/ui/date-picker.test.tsx`
- **テスト内容**:
  - 基本的なレンダリング
  - 日付選択の動作
  - 無効化状態
  - 日付制限（minDate, maxDate）
  - 時間選択
  - アクセシビリティ
  - エッジケース
  - スタイリング

#### DatePickerDemoPage のテスト
- **ファイル**: `app/__tests__/date-picker-demo/page.test.tsx`
- **テスト内容**:
  - 基本的なレンダリング
  - 各DatePickerの動作
  - 状態管理
  - レスポンシブデザイン
  - アクセシビリティ
  - エラーハンドリング

## テストの実行方法

### 依存関係のインストール
```bash
npm install
```

### テストの実行
```bash
# すべてのテストを実行
npm test

# 特定のテストファイルを実行
npm test date-picker.test.tsx
npm test page.test.tsx

# ウォッチモードでテストを実行
npm run test:watch
```

### テストカバレッジの確認
```bash
npm test -- --coverage
```

## テストの特徴

### 1. モックの使用
- `react-datepicker`ライブラリをモック化して、テスト環境での安定性を確保
- CSSファイルのモック化でスタイル関連のエラーを回避

### 2. 包括的なテストケース
- **ユニットテスト**: 個々のコンポーネントの機能をテスト
- **統合テスト**: 複数のコンポーネントの連携をテスト
- **ユーザーインタラクション**: 実際のユーザー操作をシミュレート

### 3. アクセシビリティテスト
- ラベルと入力フィールドの関連付け
- 適切な見出し構造
- プレースホルダーテキスト

### 4. エラーハンドリング
- 無効な日付の処理
- 必須プロパティの欠如
- エッジケースの処理

## テストのベストプラクティス

### 1. テストの構造
```typescript
describe('コンポーネント名', () => {
  describe('機能カテゴリ', () => {
    it('具体的なテストケース', () => {
      // テストの実装
    });
  });
});
```

### 2. テストデータの管理
- 各テストで独立したデータを使用
- `beforeEach`でモックのリセット
- 実際の日付オブジェクトを使用

### 3. アサーション
- 具体的で意味のあるアサーション
- 複数の観点からの検証
- エラーメッセージの明確化

## カスタマイズのポイント

### 1. 新しいプロパティの追加
新しいプロパティを追加する場合：
1. コンポーネントにプロパティを追加
2. TypeScriptインターフェースを更新
3. 対応するテストケースを作成

### 2. 新しい機能の追加
新しい機能を追加する場合：
1. 機能の実装
2. ユニットテストの作成
3. 統合テストの更新

### 3. スタイルの変更
スタイルを変更する場合：
1. CSSクラスの更新
2. スタイル関連のテストケースの更新

## トラブルシューティング

### よくある問題

1. **モックの設定エラー**
   - `jest.mock()`の設定を確認
   - モック関数の戻り値を適切に設定

2. **非同期テストの失敗**
   - `waitFor`を使用して非同期処理を待機
   - `userEvent`の適切な使用

3. **CSSクラスのテスト失敗**
   - Tailwind CSSクラスの確認
   - クラス名の正確性を確認

### デバッグのヒント

1. **テストの実行順序**
   ```bash
   npm test -- --verbose
   ```

2. **特定のテストの実行**
   ```bash
   npm test -- --testNamePattern="テスト名"
   ```

3. **テスト環境の確認**
   ```bash
   npm test -- --detectOpenHandles
   ```

## 今後の拡張

### 1. E2Eテストの追加
- PlaywrightやCypressを使用したE2Eテスト
- 実際のブラウザ環境でのテスト

### 2. パフォーマンステスト
- 大量のデータでの動作確認
- メモリリークの検出

### 3. アクセシビリティテストの強化
- axe-coreを使用した自動アクセシビリティテスト
- スクリーンリーダーのテスト

## 参考資料

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest](https://jestjs.io/docs/getting-started)
- [react-datepicker](https://reactdatepicker.com/)
- [@testing-library/user-event](https://testing-library.com/docs/user-event/intro/) 