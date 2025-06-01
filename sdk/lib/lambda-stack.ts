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

        // SHA256ハッシュの計算
        const hash = execSync(
          `openssl dgst -sha256 -binary ${zipPath} | openssl enc -base64 | tr -d '\n'`,
          { encoding: "utf-8" }
        );
        fs.writeFileSync(path.join(distDir, "index.zip.base64sha256"), hash);

        // S3へのアップロード
        const zipKey = `${functionName}/index-${hash}.zip`;
        execSync(
          `aws s3 cp ${zipPath} s3://${appConfig.s3BucketName}/${zipKey}`,
          { stdio: "inherit" }
        );
        execSync(
          `aws s3 cp ${path.join(distDir, "index.zip.base64sha256")} s3://${appConfig.s3BucketName}/${functionName}/index.zip.base64sha256.txt --content-type 'text/plain'`,
          { stdio: "inherit" }
        );

        // Lambda関数の作成
        new lambda.Function(this, `${functionName}Function`, {
          functionName: functionName,
          handler: config.handler,
          runtime: lambda.Runtime.NODEJS_18_X,
          role: lambdaRole,
          code: lambda.Code.fromBucket(bucket, `${functionName}/index.zip`),
          environment: config.env,
          timeout: cdk.Duration.seconds(900),
        });
      } catch (error) {
        console.error(`Error building Lambda function ${functionName}:`, error);
        throw error;
      }
    }
  }
}
