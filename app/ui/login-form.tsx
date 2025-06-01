"use client";

import { useState } from "react";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import AcmeLogo from "@/app/ui/acme-logo"; // ロゴコンポーネント例
import { AtSymbolIcon, KeyIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "./button";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    // email -> username に名称変更
    const username = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Cognitoでユーザー名ログイン
      const client = new CognitoIdentityProviderClient({
        region: "ap-northeast-1",
      });
      const command = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      });
      const response = await client.send(command);
      if (response.AuthenticationResult?.IdToken) {
        // idTokenをlocalStorageに保存
        localStorage.setItem("idToken", response.AuthenticationResult.IdToken);
        router.push("/dashboard");
      } else {
        setError("認証に失敗しました");
      }
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        setError(err.message || "ログインに失敗しました");
      } else {
        setError("ログインに失敗しました");
      }
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <div className="w-full">
          <div>
            <div className="h-20 flex items-center justify-center bg-blue-700">
              <AcmeLogo />
            </div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              ユーザー名
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="text"
                name="email"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              パスワード
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                // placeholder="Enter password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Button
            type="submit"
            className="mt-4 w-full bg-transparent border border-black  !bg-black !text-white transition-colors"
          >
            ログイン
          </Button>
        </div>
        {/* <Authenticator /> ← これを削除 */}

        <div className="flex h-8 items-end space-x-1">
          {/* Add form errors here */}
        </div>
      </div>
    </form>
  );
}

{
  /*
      <div className="flex justify-end">
        <Link
          href="/signup"
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          アカウントを作成
        </Link>
      </div>
      */
}
