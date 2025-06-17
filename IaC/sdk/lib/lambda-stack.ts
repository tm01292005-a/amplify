import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { appConfig } from "../src/config";

export class LambdaStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 既存のS3バケットを参照
    const bucket = s3.Bucket.fromBucketName(
      this,
      "LambdaAssetsBucket",
      appConfig.s3BucketName
    );

    // Lambda実行ロールの作成
    const lambdaRole = new iam.Role(this, "LambdaExecutionRole", {
      roleName: appConfig.lambdaExecRoleName,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    // Lambda関数の作成
    for (const [functionName, config] of Object.entries(
      appConfig.lambdaFunctions
    )) {
      const lambdaDir = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "lambda",
        functionName
      );
      const distDir = path.join(lambdaDir, "dist");

      // ビルド処理
      try {
        // npm install
        execSync("npm install", { cwd: lambdaDir, stdio: "inherit" });

        // npm run build
        execSync("npm run build", { cwd: lambdaDir, stdio: "inherit" });

        // ZIPファイルの作成
        const zipPath = path.join(distDir, "index.zip");
        if (!fs.existsSync(distDir)) {
          fs.mkdirSync(distDir, { recursive: true });
        }
        execSync(`cd ${lambdaDir} && zip -r dist/index.zip . -i "*.mjs"`, {
          stdio: "inherit",
        });

        // 日時文字列の生成（YYYYMMDDHHmmss）
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, "0");
        const datetime = `${now.getFullYear()}${pad(
          now.getMonth() + 1
        )}${pad(now.getDate())}${pad(now.getHours())}${pad(
          now.getMinutes()
        )}${pad(now.getSeconds())}`;
        fs.writeFileSync(
          path.join(distDir, "index.zip.base64sha256"),
          datetime
        );

        // S3へのアップロード
        const zipKey = `${functionName}/index-${datetime}.zip`;
        const zipBase64Key = `${functionName}/index-${datetime}.zip.base64sha256`;
        execSync(
          `aws s3 cp ${zipPath} s3://${appConfig.s3BucketName}/${zipKey}`,
          { stdio: "inherit" }
        );
        execSync(
          `aws s3 cp ${path.join(distDir, "index.zip.base64sha256")} s3://${appConfig.s3BucketName}/${zipBase64Key}.txt --content-type 'text/plain'`,
          { stdio: "inherit" }
        );

        // Lambda関数の作成
        const fn = new lambda.Function(this, `${functionName}Function`, {
          functionName: functionName,
          handler: config.handler,
          runtime: lambda.Runtime.NODEJS_18_X,
          role: lambdaRole,
          code: lambda.Code.fromBucket(bucket, zipKey),
          environment: config.env,
          timeout: cdk.Duration.seconds(900),
        });
        // API GatewayからのInvoke権限をLambdaに付与
        fn.addPermission(`${functionName}ApiGatewayInvoke`, {
          principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
          action: "lambda:InvokeFunction",
          sourceArn: `arn:aws:execute-api:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:*/*/*/${functionName}`,
        });
      } catch (error) {
        console.error(`Error building Lambda function ${functionName}:`, error);
        throw error;
      }
    }
  }
}
