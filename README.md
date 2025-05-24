＜初期設定＞
npm install -g @aws-amplify/cli
amplify configure
・ユーザーは作らなくていい
・accessKeyIdとsecretAccessKeyを入力
・Profile Nameは任意

npm add --save-dev @aws-amplify/backend@latest @aws-amplify/backend-cli@latest

＜新規作成＞
git init
npm create amplify@latest
　Ok to proceed? (y) y

＜既存プロジェクトから開発＞
・空のディレクトリで
　amplify init --app (レポジトリ URL)
  (ex. amplify init --app https://github.com/xxxx/xxxxx.git)

　√ Do you want to continue with Amplify Gen 1? (y/N) · no
　√ Where should we create your project? .(Enterキー押下)

＜サンドボックス実行＞
npx ampx sandbox
-- サンドボックス一覧
npx ampx sandbox secret list



＜参考URL＞
https://qiita.com/makishy/items/6072d4e8bebea0f1604c



＜認証(Cognito)追加＞
npm install @aws-amplify/ui-react
amplify add auth
amplify push

＜Lambda追加＞
npm add --save-dev @types/aws-lambda



＜API Gateway追加＞
amplify add api

