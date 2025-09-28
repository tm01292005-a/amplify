import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright 設定:
 * - webServer: Next.js dev サーバを自動起動
 * - baseURL: テスト内の page.goto('/') を簡潔に
 * - スクリーンショット: 明示的 toHaveScreenshot 以外は失敗時のみ
 */
export default defineConfig({
	testDir: "./tests/e2e",
	timeout: 30_000,
	retries: 0,
	use: {
		baseURL: process.env.BASE_URL || "http://localhost:3000",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},
	webServer: {
		command: "npm run dev",
		url: "http://localhost:3000",
		reuseExistingServer: true,
		timeout: 120_000,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
