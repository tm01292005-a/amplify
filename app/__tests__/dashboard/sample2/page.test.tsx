import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Page from "@/app/dashboard/sample2/page";

// Sample2ページの単体テスト
describe("Page (dashboard/sample2)", () => {
	// fetchのモック関数
	const mockFetch = jest.fn();
	const OLD_ENV = process.env;

	beforeEach(() => {
		jest.resetModules();
		// process.envのモック
		process.env = {
			...OLD_ENV,
			NEXT_PUBLIC_API_BASE_URL: "https://api.example.com",
			NEXT_PUBLIC_API_KEY: "dummy-key",
		};
		// fetchのモック
		global.fetch = mockFetch;
		// localStorageのモック
		Storage.prototype.getItem = jest.fn(() => "dummy-token");
	});

	afterEach(() => {
		jest.clearAllMocks();
		process.env = OLD_ENV;
	});

	it("フォーム入力と送信ボタンが表示される", () => {
		// 入力フォームと送信ボタンの表示確認
		render(<Page />);
		expect(screen.getByPlaceholderText("key1")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("key2")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("key3")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "送信" })).toBeInTheDocument();
	});

	it("API成功時にレスポンスが表示される", async () => {
		// fetchの成功レスポンスをモック
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ result: "ok", foo: 123 }),
		} as any);

		render(<Page />);
		// フォーム入力
		fireEvent.change(screen.getByPlaceholderText("key1"), { target: { value: "a" } });
		fireEvent.change(screen.getByPlaceholderText("key2"), { target: { value: "b" } });
		fireEvent.change(screen.getByPlaceholderText("key3"), { target: { value: "c" } });
		// 送信ボタン押下
		fireEvent.click(screen.getByRole("button", { name: "送信" }));

		// レスポンス表示を検証
		expect(await screen.findByText("APIレスポンス:")).toBeInTheDocument();
		expect(await screen.findByText(/"result": "ok"/)).toBeInTheDocument();

		// fetch呼び出し内容の検証
		expect(mockFetch).toHaveBeenCalledWith(
			"https://api.example.com/sample2?key1=a&key2=b&key3=c",
			expect.objectContaining({
				method: "GET",
				headers: expect.objectContaining({
					Authorization: "dummy-token",
					"x-api-key": "dummy-key",
				}),
			})
		);
	});

	it("APIエラー時にエラーメッセージが表示される", async () => {
		// fetchのエラーレスポンスをモック
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 403,
			json: async () => ({ message: "Forbidden" }),
		} as any);

		render(<Page />);
		// 送信ボタン押下
		fireEvent.click(screen.getByRole("button", { name: "送信" }));

		// エラーメッセージ表示を検証
		expect(await screen.findByText(/API Error: 403: Forbidden/)).toBeInTheDocument();
	});

	it("APIレスポンスが不正な場合もエラー表示", async () => {
		// fetchの不正なレスポンスをモック
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 500,
			json: async () => {
				throw new Error("parse error");
			},
		} as any);

		render(<Page />);
		// 送信ボタン押下
		fireEvent.click(screen.getByRole("button", { name: "送信" }));

		// エラーメッセージ表示を検証
		expect(await screen.findByText(/API Error: 500/)).toBeInTheDocument();
	});
});
