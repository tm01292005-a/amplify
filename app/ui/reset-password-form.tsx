"use client";

import { useState, useEffect } from "react";
import {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Button } from "./button";
import outputs from "@/amplify_outputs.json";
import Link from "next/link";
import { showNotification } from "@mantine/notifications";

const AWS_REGION = outputs.auth.aws_region;

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "verification">("email");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  useEffect(() => {
    if (retryAfter !== null) {
      const timer = setInterval(() => {
        setRetryAfter((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [retryAfter]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const client = new CognitoIdentityProviderClient({
        region: AWS_REGION,
      });

      const command = new ForgotPasswordCommand({
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        Username: email,
      });

      console.log("Sending forgot password request with:", {
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        Username: email,
        Region: AWS_REGION,
      });

      const response = await client.send(command);
      console.log("Forgot password response:", {
        statusCode: response.$metadata.httpStatusCode,
        requestId: response.$metadata.requestId,
        response: response,
      });

      if (response.$metadata.httpStatusCode === 200) {
        setSuccess(
          "確認コードをメールで送信しました。メールをご確認ください。迷惑メールフォルダもご確認ください。"
        );
        setStep("verification");
      } else {
        setError("パスワードリセットのリクエストに失敗しました");
        showNotification({
          title: "エラー",
          message: "パスワードリセットのリクエストに失敗しました",
          color: "red",
          position: "top-center",
        });
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      if (err instanceof Error) {
        const errorMessage = err.message;
        console.log("Error message:", errorMessage);

        if (errorMessage.includes("Attempt limit exceeded")) {
          setRetryAfter(300); // 5分間の待機時間を設定
          setError(
            "リクエスト回数が制限を超えました。5分後に再度お試しください。"
          );
          showNotification({
            title: "エラー",
            message:
              "リクエスト回数が制限を超えました。5分後に再度お試しください。",
            color: "red",
            position: "top-center",
          });
        } else if (
          errorMessage.includes("Username/client id combination not found")
        ) {
          setError(
            "このメールアドレスは登録されていません。サインアップページから新規登録してください。"
          );
          showNotification({
            title: "エラー",
            message:
              "このメールアドレスは登録されていません。サインアップページから新規登録してください。",
            color: "red",
            position: "top-center",
          });
        } else if (errorMessage.includes("Invalid email address format")) {
          setError("メールアドレスの形式が正しくありません");
          showNotification({
            title: "エラー",
            message: "メールアドレスの形式が正しくありません",
            color: "red",
            position: "top-center",
          });
        } else if (errorMessage.includes("User is disabled")) {
          setError("このアカウントは無効化されています");
          showNotification({
            title: "エラー",
            message: "このアカウントは無効化されています",
            color: "red",
            position: "top-center",
          });
        } else if (errorMessage.includes("Invalid client id")) {
          setError("認証設定に問題があります。管理者にお問い合わせください。");
          showNotification({
            title: "エラー",
            message: "認証設定に問題があります。管理者にお問い合わせください。",
            color: "red",
            position: "top-center",
          });
        } else {
          setError(
            `パスワードリセットのリクエストに失敗しました: ${errorMessage}`
          );
          showNotification({
            title: "エラー",
            message: `パスワードリセットのリクエストに失敗しました: ${errorMessage}`,
            color: "red",
            position: "top-center",
          });
        }
      } else {
        setError("パスワードリセットのリクエストに失敗しました");
        showNotification({
          title: "エラー",
          message: "パスワードリセットのリクエストに失敗しました",
          color: "red",
          position: "top-center",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const client = new CognitoIdentityProviderClient({
        region: AWS_REGION,
      });

      const command = new ConfirmForgotPasswordCommand({
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        Username: email,
        ConfirmationCode: verificationCode,
        Password: newPassword,
      });

      await client.send(command);
      setSuccess(
        "パスワードが正常にリセットされました。新しいパスワードでログインしてください。"
      );
      // 3秒後にログインページにリダイレクト
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        const errorMessage = err.message;
        if (errorMessage.includes("Invalid verification code")) {
          setError("確認コードが正しくありません");
          showNotification({
            title: "エラー",
            message: "確認コードが正しくありません",
            color: "red",
          });
        } else if (
          errorMessage.includes("Password did not conform with policy")
        ) {
          setError(
            "パスワードは8文字以上で、大文字・小文字・数字・特殊文字を含める必要があります"
          );
          showNotification({
            title: "エラー",
            message:
              "パスワードは8文字以上で、大文字・小文字・数字・特殊文字を含める必要があります",
            color: "red",
          });
        } else {
          setError(`パスワードのリセットに失敗しました: ${errorMessage}`);
          showNotification({
            title: "エラー",
            message: `パスワードのリセットに失敗しました: ${errorMessage}`,
            color: "red",
          });
        }
      } else {
        setError("パスワードのリセットに失敗しました");
        showNotification({
          title: "エラー",
          message: "パスワードのリセットに失敗しました",
          color: "red",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === "email" ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="example@example.com"
              disabled={retryAfter !== null}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {retryAfter !== null && (
            <div className="text-blue-600 text-sm">
              再試行まであと {Math.floor(retryAfter / 60)}分{retryAfter % 60}秒
            </div>
          )}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || retryAfter !== null}
          >
            {loading ? "送信中..." : "リセットリンクを送信"}
          </Button>
          <div className="mt-4 text-center">
            <Link
              href="/signup"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              アカウントをお持ちでない方はこちら
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerificationSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium">
              確認コード
            </label>
            <input
              id="code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="123456"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium">
              新しいパスワード
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="新しいパスワードを入力"
            />
            <p className="mt-1 text-xs text-gray-500">
              パスワードは8文字以上で、大文字・小文字・数字・特殊文字を含める必要があります
            </p>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "処理中..." : "パスワードをリセット"}
          </Button>
        </form>
      )}
    </div>
  );
}
