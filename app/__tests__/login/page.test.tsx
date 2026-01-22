import { render, screen } from "@testing-library/react";
import LoginPage from "../../login/page";
import { MantineProvider } from "@mantine/core";

// Mock useRouter
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// LoginPageのレンダリングテスト

describe("LoginPage", () => {
  it("サインインのタイトルとLoginFormが表示される", () => {
    render(
      <MantineProvider>
        <LoginPage />
      </MantineProvider>
    );
    // タイトル
    expect(screen.getByText("サインイン")).toBeInTheDocument();
    // LoginFormのユーザー名入力欄 - Mantineのラベルは別のテキストなので、ラベルテキストで探す
    expect(screen.getByText("ユーザー名")).toBeInTheDocument();
    // 実際の入力欄も存在することを確認
    expect(screen.getByPlaceholderText("ユーザー名を入力")).toBeInTheDocument();
    // LoginFormのパスワード入力欄
    expect(screen.getByText("パスワード")).toBeInTheDocument();
    // 実際のパスワード入力欄も存在することを確認
    expect(screen.getByPlaceholderText("パスワードを入力")).toBeInTheDocument();
    // ログインボタン
    expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument();
  });
}); 