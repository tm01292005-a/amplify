import { MantineProvider } from "@mantine/core";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
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

	it("制約付き期間選択で2023年を選択できない", async () => {
		render(
			<MantineProvider>
				<DatePickerDemoPage />
			</MantineProvider>
		);
		const user = userEvent.setup();
		// 「制約付き期間選択（2024年のみ）」のラベルを取得し、そのコンテナ内の開始ボタンをクリック
		const label = screen.getByText("2024年の期間を選択");
		const container = label.closest(".date-range-picker-container");
		expect(container).not.toBeNull();
		if (container) {
			const pickerButton = container.querySelector('[data-testid="start-date-picker"]');
			expect(pickerButton).not.toBeNull();
			if (pickerButton) {
				await user.click(pickerButton as Element);
			}
		}
		// 2023年の日付が選択できない（disabled）ことを確認
		const disabledDate = screen.queryByLabelText("1 January 2023");
		expect(disabledDate).toBeNull();
	});

	it("エラー表示DateRangePickerで開始日・終了日未選択時にエラーが表示される", async () => {
		render(
			<MantineProvider>
				<DatePickerDemoPage />
			</MantineProvider>
		);
		// 「必須項目」ラベルの下にエラー文言が表示される
		expect(screen.getByText("必須項目")).toBeInTheDocument();
		expect(screen.getByText("開始日と終了日の両方を選択してください")).toBeInTheDocument();
	});

	it("クリア機能なしDateRangePickerでクリアボタンが表示されない", async () => {
		render(
			<MantineProvider>
				<DatePickerDemoPage />
			</MantineProvider>
		);
		// 「クリア機能なしの期間選択」ラベルのDateRangePicker
		expect(screen.getByText("クリア機能なしの期間選択")).toBeInTheDocument();
		// クリアボタンが存在しない（このDateRangePickerコンテナ内を検索）
		const label = screen.getByText("クリア機能なしの期間選択");
		const container = label.closest(".date-range-picker-container") as HTMLElement | null;
		expect(container).not.toBeNull();
		if (container) {
			const clearButton = within(container as HTMLElement).queryByRole("button", {
				name: /クリア/i,
			});
			expect(clearButton).toBeNull();
		}
	});

	it("無効化された期間選択でDateRangePickerが操作不可", async () => {
		render(
			<MantineProvider>
				<DatePickerDemoPage />
			</MantineProvider>
		);
		// 「無効化されたDateRangePicker」ラベルのボタンがdisabled
		const label = screen.getByText("無効化されたDateRangePicker");
		const pickerButton = label.closest("button");
		if (pickerButton) {
			expect(pickerButton).toBeDisabled();
		}
	});
	it("基本的な期間選択でサマリーに反映される", async () => {
		render(
			<MantineProvider>
				<DatePickerDemoPage />
			</MantineProvider>
		);
		const user = userEvent.setup();
		// 「基本的な期間選択」セクション内のDateRangePickerを開く
		const sectionLabel = screen.getByText("基本的な期間選択");
		const paper = sectionLabel.closest('[data-with-border="true"]') as HTMLElement | null;
		expect(paper).not.toBeNull();
		if (!paper) throw new Error("Paper コンテナが見つかりません");
		const sectionContainer = paper.querySelector(
			".date-range-picker-container"
		) as HTMLElement | null;
		expect(sectionContainer).not.toBeNull();
		if (!sectionContainer) throw new Error("基本的な期間選択コンテナが見つかりません");
		const startButton = within(sectionContainer).getByTestId("start-date-picker");
		await user.click(startButton);
		// start picker が開いたら、document 内で該当する aria-label を持つ要素を探し、
		// 表示中のカレンダー（ダイアログ内）に属する候補を優先してクリックする
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth();
		const firstDayLabel = new Date(year, month, 1).toLocaleDateString("en-GB", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
		const lastDay = new Date(year, month + 1, 0).getDate();
		const lastDayLabel = new Date(year, month, lastDay).toLocaleDateString("en-GB", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
		await waitFor(() =>
			expect(screen.queryAllByLabelText(firstDayLabel).length).toBeGreaterThan(0)
		);
		const startDayCandidates = screen.queryAllByLabelText(firstDayLabel);
		let startDay =
			startDayCandidates.find((el) => {
				const dlg = el.closest('[role="dialog"]');
				if (!dlg) return false;
				const style = window.getComputedStyle(dlg as Element);
				return style.display !== "none" && style.opacity !== "0";
			}) ||
			startDayCandidates.find((el) => el.closest('[role="dialog"]')) ||
			startDayCandidates[0];
		if (!startDay) throw new Error("開始日の要素が見つかりません");
		await user.click(startDay);
		// 開始日がボタンに反映されるまで待つ（ポップオーバーの内部更新があるため）
		await waitFor(() => expect(startButton).toHaveTextContent(/2025|\d{4}\/\d{1,2}\/\d{1,2}/));
		// 開始日を選択した後、終了日のピッカーを開いてから終了日のポップオーバー内で選択する
		const endButton = within(sectionContainer).getByTestId("end-date-picker");
		await user.click(endButton);
		await waitFor(() =>
			expect(screen.queryAllByLabelText(lastDayLabel).length).toBeGreaterThan(0)
		);
		const endDayCandidates = screen.queryAllByLabelText(lastDayLabel);
		let endDay =
			endDayCandidates.find((el) => {
				const dlg = el.closest('[role="dialog"]');
				if (!dlg) return false;
				const style = window.getComputedStyle(dlg as Element);
				return style.display !== "none" && style.opacity !== "0";
			}) ||
			endDayCandidates.find((el) => el.closest('[role="dialog"]')) ||
			endDayCandidates[0];
		if (!endDay) throw new Error("終了日の要素が見つかりません");
		// end ボタンをクリックしたら、aria-expanded が true になるのを待ち、対応するダイアログ内の日要素を選択
		const dialogId = endButton.getAttribute("aria-controls");
		await waitFor(() => expect(endButton).toHaveAttribute("aria-expanded", "true"));
		let candidate: Element | undefined;
		if (dialogId) {
			candidate = endDayCandidates.find(
				(el) => el.closest('[role="dialog"]')?.id === dialogId
			);
		}
		if (!candidate) {
			candidate =
				endDayCandidates.find((el) => !!el.closest('[role="dialog"]')) ||
				endDayCandidates[0];
		}
		if (!candidate) throw new Error("終了日の可視要素が見つかりません");
		await user.click(candidate as Element);
		// end ボタンに選択が反映されるのを待つ
		await waitFor(() => expect(endButton).toHaveTextContent(/202\d|\d{4}\/\d{1,2}\/\d{1,2}/));
		// 終了日をクリックしたら end ボタンに選択が反映されるのを待つ（onChange が発火していることの確認）
		await waitFor(() => expect(endButton).toHaveTextContent(/202\d|\d{4}\/\d{1,2}\/\d{1,2}/));

		// サマリーに反映される（選択結果サマリー領域内で確認）
		const startJa = new Date(year, month, 1).toLocaleDateString("ja-JP");
		const endJa = new Date(year, month, lastDay).toLocaleDateString("ja-JP");
		const summaryLabel = screen.getByText("選択結果サマリー");
		const summaryPaper = summaryLabel.closest(
			'[data-with-border="true"]'
		) as HTMLElement | null;
		expect(summaryPaper).not.toBeNull();
		if (!summaryPaper) throw new Error("選択結果サマリーの Paper が見つかりません");
		const summaryWithin = within(summaryPaper);
		await waitFor(() =>
			expect(
				summaryWithin.getByText(
					(content) => content.includes(startJa) && content.includes(endJa)
				)
			).toBeInTheDocument()
		);
	});

	it("カスタムラベルのDateRangePickerでラベル・プレースホルダーが表示される", () => {
		render(
			<MantineProvider>
				<DatePickerDemoPage />
			</MantineProvider>
		);
		expect(screen.getByText("プロジェクト期間")).toBeInTheDocument();
		expect(screen.getByText("プロジェクト開始日")).toBeInTheDocument();
		expect(screen.getByText("プロジェクト終了日")).toBeInTheDocument();
		expect(screen.getByText("開始日を選択してください")).toBeInTheDocument();
		expect(screen.getByText("終了日を選択してください")).toBeInTheDocument();
	});

	it("テスト用操作ボタンで期間がセット・クリアされる", async () => {
		render(
			<MantineProvider>
				<DatePickerDemoPage />
			</MantineProvider>
		);
		const user = userEvent.setup();
		// 「6月の期間を設定」ボタンをクリック
		const setButton = screen.getByText("6月の期間を設定");
		await user.click(setButton);
		const elements2 = screen.getAllByText(/2024\/6\/1 〜 2024\/6\/30/);
		expect(elements2.length).toBeGreaterThan(0);
		// 「期間をクリア」ボタンをクリック
		const clearButton = screen.getByText("期間をクリア");
		await user.click(clearButton);
		const clearedElements = screen.getAllByText("期間が選択されていません");
		expect(clearedElements.length).toBeGreaterThan(0);
	});

	it("1つのDatePickerInputで期間選択サンプルが表示される", () => {
		render(
			<MantineProvider>
				<DatePickerDemoPage />
			</MantineProvider>
		);
		expect(screen.getByText("1つのDatePickerInputで期間選択")).toBeInTheDocument();
	});
});
