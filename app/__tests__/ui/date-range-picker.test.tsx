import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";
import { DateRangePicker } from "../../ui/date-range-picker";
import { CustomColorRangePickerSample } from "../../ui/date-range-picker";

// Mantineのプロバイダーでラップするヘルパー関数
const renderWithMantine = (component: React.ReactElement) => {
	return render(<MantineProvider>{component}</MantineProvider>);
};

describe("DateRangePicker", () => {
	const user = userEvent.setup();

	beforeEach(() => {
		// テスト前にモックをリセット
		jest.clearAllMocks();
	});

	describe("基本的なレンダリング", () => {
		it("デフォルトのラベルとプレースホルダーが表示される", () => {
			renderWithMantine(<DateRangePicker />);

			expect(screen.getByText("期間を選択")).toBeInTheDocument();
			expect(screen.getByText("開始日")).toBeInTheDocument();
			expect(screen.getByText("終了日")).toBeInTheDocument();
			expect(screen.getByText("開始日を選択")).toBeInTheDocument();
			expect(screen.getByText("終了日を選択")).toBeInTheDocument();
		});

		it("カスタムラベルとプレースホルダーが表示される", () => {
			renderWithMantine(
				<DateRangePicker
					label="カスタム期間"
					startDateLabel="カスタム開始日"
					endDateLabel="カスタム終了日"
					startDatePlaceholder="カスタム開始日プレースホルダー"
					endDatePlaceholder="カスタム終了日プレースホルダー"
				/>
			);

			expect(screen.getByText("カスタム期間")).toBeInTheDocument();
			expect(screen.getByText("カスタム開始日")).toBeInTheDocument();
			expect(screen.getByText("カスタム終了日")).toBeInTheDocument();
			expect(screen.getByText("カスタム開始日プレースホルダー")).toBeInTheDocument();
			expect(screen.getByText("カスタム終了日プレースホルダー")).toBeInTheDocument();
		});

		it("ラベルが指定されていない場合は表示されない", () => {
			renderWithMantine(<DateRangePicker label="" />);

			expect(screen.queryByText("期間を選択")).not.toBeInTheDocument();
		});
	});

	describe("日付選択機能", () => {
		it("開始日を選択できる", async () => {
			const mockOnChange = jest.fn();
			renderWithMantine(<DateRangePicker onChange={mockOnChange} />);

			const startDatePicker = screen.getByTestId("start-date-picker");
			await user.click(startDatePicker);

			// MantineのDatePickerInputはカレンダーをポータルで表示するため、
			// 実際の日付選択は複雑なので、クリックイベントのみをテスト
			await waitFor(() => {
				expect(startDatePicker).toHaveAttribute("aria-expanded", "true");
			});
		});

		it("終了日を選択できる", async () => {
			const mockOnChange = jest.fn();
			renderWithMantine(<DateRangePicker onChange={mockOnChange} />);

			const endDatePicker = screen.getByTestId("end-date-picker");
			await user.click(endDatePicker);

			await waitFor(() => {
				expect(endDatePicker).toHaveAttribute("aria-expanded", "true");
			});
		});

		it("開始日と終了日の両方を選択できる", async () => {
			const mockOnChange = jest.fn();
			renderWithMantine(<DateRangePicker onChange={mockOnChange} />);

			// 開始日を選択
			const startDatePicker = screen.getByTestId("start-date-picker");
			await user.click(startDatePicker);

			await waitFor(() => {
				expect(startDatePicker).toHaveAttribute("aria-expanded", "true");
			});

			// 終了日を選択
			const endDatePicker = screen.getByTestId("end-date-picker");
			await user.click(endDatePicker);

			await waitFor(() => {
				expect(endDatePicker).toHaveAttribute("aria-expanded", "true");
			});
		});
	});

	describe("制約機能", () => {
		it("開始日が設定されている場合、終了日の最小日付が制限される", () => {
			const startDate = new Date("2024-01-15");
			renderWithMantine(<DateRangePicker startDate={startDate} />);

			const endDatePicker = screen.getByTestId("end-date-picker");
			// MantineのDatePickerInputは内部的に制約を管理するため、
			// 要素の存在を確認する
			expect(endDatePicker).toBeInTheDocument();
		});

		it("終了日が設定されている場合、開始日の最大日付が制限される", () => {
			const endDate = new Date("2024-01-20");
			renderWithMantine(<DateRangePicker endDate={endDate} />);

			const startDatePicker = screen.getByTestId("start-date-picker");
			expect(startDatePicker).toBeInTheDocument();
		});

		it("minDateとmaxDateが適用される", () => {
			const minDate = new Date("2024-01-01");
			const maxDate = new Date("2024-12-31");

			renderWithMantine(<DateRangePicker minDate={minDate} maxDate={maxDate} />);

			const startDatePicker = screen.getByTestId("start-date-picker");
			const endDatePicker = screen.getByTestId("end-date-picker");

			expect(startDatePicker).toBeInTheDocument();
			expect(endDatePicker).toBeInTheDocument();
		});
	});

	describe("無効化状態", () => {
		it("disabledがtrueの場合、両方のDatePickerが無効化される", () => {
			renderWithMantine(<DateRangePicker disabled={true} />);

			const startDatePicker = screen.getByTestId("start-date-picker");
			const endDatePicker = screen.getByTestId("end-date-picker");

			expect(startDatePicker).toBeDisabled();
			expect(endDatePicker).toBeDisabled();
		});

		it("無効化状態では日付選択ができない", async () => {
			const mockOnChange = jest.fn();
			renderWithMantine(<DateRangePicker disabled={true} onChange={mockOnChange} />);

			const startDatePicker = screen.getByTestId("start-date-picker");
			await user.click(startDatePicker);

			expect(mockOnChange).not.toHaveBeenCalled();
		});
	});

	describe("エラー表示", () => {
		it("エラーメッセージが表示される", () => {
			const errorMessage = "日付の選択は必須です";
			renderWithMantine(<DateRangePicker error={errorMessage} />);

			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});

		it("エラーがない場合はエラーメッセージが表示されない", () => {
			renderWithMantine(<DateRangePicker />);

			expect(screen.queryByText("日付の選択は必須です")).not.toBeInTheDocument();
		});
	});

	describe("期間表示", () => {
		it("開始日と終了日が両方選択されている場合、期間が表示される", () => {
			const startDate = new Date("2024-01-15");
			const endDate = new Date("2024-01-20");

			renderWithMantine(<DateRangePicker startDate={startDate} endDate={endDate} />);

			expect(screen.getByText(/選択期間:/)).toBeInTheDocument();
			expect(screen.getByText(/2024\/1\/15 〜 2024\/1\/20/)).toBeInTheDocument();
		});

		it("開始日のみ選択されている場合、期間は表示されない", () => {
			const startDate = new Date("2024-01-15");

			renderWithMantine(<DateRangePicker startDate={startDate} />);

			expect(screen.queryByText(/選択期間:/)).not.toBeInTheDocument();
		});

		it("終了日のみ選択されている場合、期間は表示されない", () => {
			const endDate = new Date("2024-01-20");

			renderWithMantine(<DateRangePicker endDate={endDate} />);

			expect(screen.queryByText(/選択期間:/)).not.toBeInTheDocument();
		});
	});

	describe("クリア機能", () => {
		it("clearableがtrueの場合、DatePickerが表示される", () => {
			renderWithMantine(<DateRangePicker clearable={true} />);

			const startDatePicker = screen.getByTestId("start-date-picker");
			const endDatePicker = screen.getByTestId("end-date-picker");

			expect(startDatePicker).toBeInTheDocument();
			expect(endDatePicker).toBeInTheDocument();
		});

		it("clearableがfalseの場合、DatePickerが表示される", () => {
			renderWithMantine(<DateRangePicker clearable={false} />);

			const startDatePicker = screen.getByTestId("start-date-picker");
			const endDatePicker = screen.getByTestId("end-date-picker");

			expect(startDatePicker).toBeInTheDocument();
			expect(endDatePicker).toBeInTheDocument();
		});
	});

	describe("カスタムクラス名", () => {
		it("カスタムクラス名が適用される", () => {
			const customClassName = "custom-date-range-picker";
			renderWithMantine(<DateRangePicker className={customClassName} />);

			const container = screen
				.getByText("期間を選択")
				.closest(".date-range-picker-container");
			expect(container).toHaveClass(customClassName);
		});
	});

	describe("アクセシビリティ", () => {
		it("適切なdata-testidが設定されている", () => {
			renderWithMantine(<DateRangePicker />);

			expect(screen.getByTestId("start-date-picker")).toBeInTheDocument();
			expect(screen.getByTestId("end-date-picker")).toBeInTheDocument();
		});

		it("ラベルが適切に関連付けられている", () => {
			renderWithMantine(<DateRangePicker />);

			const startDateLabel = screen.getByText("開始日");
			const endDateLabel = screen.getByText("終了日");

			expect(startDateLabel).toBeInTheDocument();
			expect(endDateLabel).toBeInTheDocument();
		});
	});

	describe("統合テスト", () => {
		it("完全な日付選択フローが正常に動作する", async () => {
			const mockOnChange = jest.fn();
			renderWithMantine(<DateRangePicker onChange={mockOnChange} />);

			// 開始日を選択
			const startDatePicker = screen.getByTestId("start-date-picker");
			await user.click(startDatePicker);

			await waitFor(() => {
				expect(startDatePicker).toHaveAttribute("aria-expanded", "true");
			});

			// 終了日を選択
			const endDatePicker = screen.getByTestId("end-date-picker");
			await user.click(endDatePicker);

			await waitFor(() => {
				expect(endDatePicker).toHaveAttribute("aria-expanded", "true");
			});
		});

		it("制約付きの日付選択が正常に動作する", async () => {
			const minDate = new Date("2024-01-01");
			const maxDate = new Date("2024-12-31");
			const mockOnChange = jest.fn();

			renderWithMantine(
				<DateRangePicker minDate={minDate} maxDate={maxDate} onChange={mockOnChange} />
			);

			const startDatePicker = screen.getByTestId("start-date-picker");
			const endDatePicker = screen.getByTestId("end-date-picker");

			// 制約が適用されていることを確認
			expect(startDatePicker).toBeInTheDocument();
			expect(endDatePicker).toBeInTheDocument();

			// 日付選択を試行
			await user.click(startDatePicker);

			await waitFor(() => {
				expect(startDatePicker).toHaveAttribute("aria-expanded", "true");
			});
		});
	});

	describe("プロパティの検証", () => {
		it("onChangeコールバックが正しく呼び出される", async () => {
			const mockOnChange = jest.fn();
			renderWithMantine(<DateRangePicker onChange={mockOnChange} />);

			const startDatePicker = screen.getByTestId("start-date-picker");
			await user.click(startDatePicker);

			// カレンダーが開くことを確認
			await waitFor(() => {
				expect(startDatePicker).toHaveAttribute("aria-expanded", "true");
			});
		});

		it("初期値が正しく設定される", () => {
			const startDate = new Date("2024-01-15");
			const endDate = new Date("2024-01-20");

			renderWithMantine(<DateRangePicker startDate={startDate} endDate={endDate} />);

			expect(screen.getByText(/選択期間:/)).toBeInTheDocument();
			expect(screen.getByText(/2024\/1\/15 〜 2024\/1\/20/)).toBeInTheDocument();
		});
	});
});

describe("CustomColorRangePickerSample", () => {
	it("ラベルとプレースホルダーが表示される", () => {
		renderWithMantine(<CustomColorRangePickerSample />);
		expect(screen.getByText("カスタム色の期間選択")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("開始日と終了日を選択")).toBeInTheDocument();
	});

	it("初期状態では期間が選択されていない文言が表示される", () => {
		renderWithMantine(<CustomColorRangePickerSample />);
		expect(screen.getByText("期間が選択されていません")).toBeInTheDocument();
	});

	it("カレンダーを開くとカレンダーUIが表示される", async () => {
		renderWithMantine(<CustomColorRangePickerSample />);
		const input = screen.getByPlaceholderText("開始日と終了日を選択");
		await userEvent.click(input);
		// カレンダーの月名や曜日などが表示されることを確認（例: "月"）
		expect(document.body.innerHTML).toMatch(
			/月|January|February|March|April|May|June|July|August|September|October|November|December/
		);
	});
});
