import { MantineProvider } from "@mantine/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DatePickerDemoPage from "../../date-range-picker-demo/page";

/**
 * 指定した年月の1日と15日を "1 January 2025" 形式で返す
 * @param year 年（例: 2025）
 * @param month 月（0-indexed, 例: 0=1月）
 * @returns [1日, 15日] のフォーマット済み文字列タプル
 */
function getFormattedFirstAndFifteenth(year: number, month: number): [string, string] {
	const formatDate = (date: Date): string =>
		date.toLocaleDateString("en-GB", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	const firstDay = new Date(year, month, 1);
	const fifteenthDay = new Date(year, month, 15);
	return [formatDate(firstDay), formatDate(fifteenthDay)];
}

describe("DatePickerDemoPage", () => {
	afterEach(() => {
		cleanup();
		document.body.innerHTML = "";
	});
	it("test", async () => {
		render(
			<MantineProvider>
				<DatePickerDemoPage />
			</MantineProvider>
		);
		const user = userEvent.setup();
		const span = screen.getByText("開始日と終了日を選択");
		const button = span.closest("button");
		if (!button) {
			throw new Error("Button not found");
		}
		await user.click(button);

		// 1秒間待機してから画面の状態を確認
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// 現在の年月の1日と15日を "1 January 2025" 形式で取得
		const now = new Date();
		const [firstDayStr, fifteenthDayStr] = getFormattedFirstAndFifteenth(
			now.getFullYear(),
			now.getMonth()
		);

		// カレンダーの日付が出現するまで待機
		await waitFor(() => expect(screen.getByLabelText(firstDayStr)).toBeInTheDocument());

		// aria-labelが1 August 2025のカレンダーをクリック
		await user.click(screen.getByLabelText(firstDayStr));
		await user.click(screen.getByLabelText(fifteenthDayStr));

		//screen.debug(undefined, Infinity);
		//screen.logTestingPlaygroundURL();
	});
});
