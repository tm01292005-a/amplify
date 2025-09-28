import { test, expect } from "@playwright/test";

/**
 * /login ページ E2E:
 * - 初期表示
 * - 失敗シナリオ (モック: エラー)
 * - 成功シナリオ (モック: 正常応答で dashboard へ遷移)
 * Cognito InitiateAuth を ネットワークモックして deterministic にする。
 */

const COGNITO_PATH_REGEX = /cognito-identity|cognito-idp|InitiateAuth/i;

test.describe("ログインページ", () => {
	test.beforeEach(async ({ page }) => {
		// 失敗/成功毎にオーバーライドされるがデフォルトは fail にしておく
		await page.route("**/*", async (route) => {
			const url = route.request().url();
			if (COGNITO_PATH_REGEX.test(url) && route.request().method() === "POST") {
				// デフォルト (上書きされなかったケース) は認証失敗を返す
				return route.fulfill({
					status: 400,
					contentType: "application/json",
					body: JSON.stringify({
						__type: "NotAuthorizedException",
						message: "Incorrect username or password.",
					}),
				});
			}
			return route.continue();
		});
	});

	test("初期表示で必要な要素が表示される", async ({ page }) => {
		await page.goto("/login");
		await expect(page.getByRole("heading", { name: "サインイン" })).toBeVisible();
		await expect(page.getByLabel("ユーザー名")).toBeVisible();
		await expect(page.getByLabel("パスワード")).toBeVisible();
		await expect(page.getByRole("button", { name: "ログイン" })).toBeVisible();
		await expect(page).toHaveScreenshot("login-initial.png");
	});

	test("認証失敗でエラー表示 (モック)", async ({ page }) => {
		await page.goto("/login");
		await page.getByLabel("ユーザー名").fill("dummyuser");
		await page.getByLabel("パスワード").fill("dummyPassword1!");
		await page.getByRole("button", { name: "ログイン" }).click();
		await expect(page.getByText("Incorrect username or password.")).toBeVisible();
		await expect(page).toHaveScreenshot("login-error.png");
	});

	test("認証成功で dashboard に遷移 (モック)", async ({ page }) => {
		// 成功用ルートを上書き
		await page.unroute("**/*");
		await page.route("**/*", async (route) => {
			const url = route.request().url();
			if (COGNITO_PATH_REGEX.test(url) && route.request().method() === "POST") {
				return route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						AuthenticationResult: {
							IdToken: "dummy-id-token",
							AccessToken: "dummy-access-token",
						},
					}),
				});
			}
			return route.continue();
		});

		await page.goto("/login");
		await page.getByLabel("ユーザー名").fill("validuser");
		await page.getByLabel("パスワード").fill("ValidPassword1!");
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("**/dashboard**", { timeout: 15_000 });
		await expect(page).toHaveScreenshot("login-success-dashboard.png");
	});
});
