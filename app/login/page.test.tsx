import { render, screen } from "@testing-library/react";
import LoginPage from "./page";

// LoginPageのレンダリングテスト

describe("LoginPage", () => {
  it("サインインのタイトルとLoginFormが表示される", () => {
    render(<LoginPage />);
    // タイトル
    expect(screen.getByText("サインイン")).toBeInTheDocument();
    // LoginFormのユーザー名入力欄
    expect(screen.getByLabelText("ユーザー名")).toBeInTheDocument();
    // LoginFormのパスワード入力欄
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    // ログインボタン
    expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument();
  });
}); 