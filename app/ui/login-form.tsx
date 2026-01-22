"use client";

import { useState } from "react";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import AcmeLogo from "@/app/ui/acme-logo";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Stack,
  Anchor,
  Text,
  Box,
} from "@mantine/core";
import { IconAt, IconLock } from "@tabler/icons-react";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
        notifications.show({
          title: "エラー",
          message: "認証に失敗しました",
          color: "red",
          position: "top-center",
        });
      }
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        setError(err.message || "ログインに失敗しました");
        notifications.show({
          title: "エラー",
          message: "ログインに失敗しました",
          color: "red",
          position: "top-center",
        });
      } else {
        setError("ログインに失敗しました");
        notifications.show({
          title: "エラー",
          message: "ログインに失敗しました",
          color: "red",
          position: "top-center",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Stack gap="lg">
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1c7ed6",
              height: "80px",
              borderRadius: "8px",
            }}
          >
            <AcmeLogo />
          </Box>

          <TextInput
            label="ユーザー名"
            id="email"
            name="email"
            placeholder="ユーザー名を入力"
            leftSection={<IconAt size={16} />}
            required
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            size="md"
          />

          <PasswordInput
            label="パスワード"
            id="password"
            name="password"
            placeholder="パスワードを入力"
            leftSection={<IconLock size={16} />}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            size="md"
          />

          <Button type="submit" fullWidth size="md" loading={loading}>
            ログイン
          </Button>

          <Box style={{ textAlign: "center" }}>
            <Anchor href="/reset-password" size="sm">
              パスワードをお忘れですか？
            </Anchor>
          </Box>

          {error && (
            <Text c="red" size="sm" ta="center">
              {error}
            </Text>
          )}
        </Stack>
      </Paper>
    </form>
  );
}
