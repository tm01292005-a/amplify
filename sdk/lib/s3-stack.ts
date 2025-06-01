import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { appConfig } from "../src/config";

export class S3Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3バケットの作成と設定
    /*
    const bucket = new s3.Bucket(this, "MyBucket", {
      bucketName: appConfig.s3BucketName,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // バケットポリシーの設定
    bucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.DENY,
        principals: [new cdk.aws_iam.AnyPrincipal()],
        actions: ["s3:*"],
        resources: [bucket.arnForObjects("*")],
        conditions: {
          Bool: {
            "aws:SecureTransport": "false",
          },
        },
      })
    );
    */
  }
}
