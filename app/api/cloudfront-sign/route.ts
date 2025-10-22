import { NextResponse } from "next/server";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { getSignedUrl } from "aws-cloudfront-sign";

// 環境変数
// - CF_PRIVATE_KEY_SECRET_NAME: Secrets Manager のシークレット名 (秘密鍵を文字列で格納)
// - CF_KEY_PAIR_ID: CloudFront に登録した Key Pair ID / Key Group の ID
// - AWS_REGION: 実行リージョン

const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION });
let cachedPrivateKey: string | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5分

/**
 * プライベートキーを取得・キャッシュする
 * @returns プライベートキー
 */
async function loadPrivateKey(): Promise<string> {
	if (cachedPrivateKey && Date.now() - cachedAt < CACHE_TTL_MS) {
		return cachedPrivateKey;
	}

	const secretName = process.env.CF_PRIVATE_KEY_SECRET_NAME;
	if (!secretName) {
		// フォールバック: Amplify の環境変数に直接 PEM を入れている場合
		if (!process.env.CF_PRIVATE_KEY) {
			throw new Error("CF_PRIVATE_KEY_SECRET_NAME or CF_PRIVATE_KEY must be set");
		}
		cachedPrivateKey = process.env.CF_PRIVATE_KEY as string;
		cachedAt = Date.now();
		return cachedPrivateKey;
	}

	const cmd = new GetSecretValueCommand({ SecretId: secretName });
	const res = await secretsClient.send(cmd);
	if (!res.SecretString) {
		throw new Error("Secret has no string value");
	}
	cachedPrivateKey = res.SecretString;
	cachedAt = Date.now();
	return cachedPrivateKey;
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const resourceUrl = body.url as string;
		if (!resourceUrl) {
			return NextResponse.json({ error: "url is required" }, { status: 400 });
		}

		const privateKey = await loadPrivateKey();
		const keyPairId = process.env.CF_KEY_PAIR_ID;
		if (!keyPairId) {
			return NextResponse.json({ error: "CF_KEY_PAIR_ID not set" }, { status: 500 });
		}

		const expires = Math.floor(Date.now() / 1000) + 5 * 60; // 5分
		const signed = getSignedUrl(resourceUrl, {
			keypairId: keyPairId,
			privateKeyString: privateKey,
			expireTime: expires,
		});

		return NextResponse.json({ url: signed });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
	}
}
