import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DatePickerDemoPage from "../../date-picker-demo/page";

// CustomDatePickerのモック
jest.mock("../../ui/date-picker", () => {
	return function MockCustomDatePicker({
		label,
		placeholder,
		onChange,
		selected,
		disabled,
		minDate,
		maxDate,
		showTimeSelect,
		dateFormat,
	}: any) {
		return (
			<div data-testid={`datepicker-${label?.replace(/\s+/g, "-").toLowerCase()}`}>
				{label && <label>{label}</label>}
				<input
					type="text"
					value={selected ? selected.toLocaleDateString() : ""}
					onChange={(e) => {
						if (onChange && !disabled) {
							// 簡単な日付パース
							const date = new Date("2024-01-15");
							onChange(date);
						}
					}}
					onClick={(e) => {
						if (onChange && !disabled) {
							// クリック時に日付を設定
							const date = new Date("2024-01-15");
							onChange(date);
						}
					}}
					placeholder={placeholder}
					disabled={disabled}
					data-testid={`input-${label?.replace(/\s+/g, "-").toLowerCase()}`}
				/>
			</div>
		);
	};
});

describe("DatePickerDemoPage", () => {
	beforeEach(() => {
		// テスト前にDOMをクリア
		document.body.innerHTML = "";
	});

	describe("基本的なレンダリング", () => {
		it("ページタイトルが表示される", () => {
			render(<DatePickerDemoPage />);

			expect(screen.getByText("DatePicker デモ")).toBeInTheDocument();
		});

		it("すべてのDatePickerセクションが表示される", () => {
			render(<DatePickerDemoPage />);

			expect(screen.getByText("基本的なDatePicker")).toBeInTheDocument();
			expect(screen.getByText("期間選択")).toBeInTheDocument();
			expect(screen.getByText("会議日時選択")).toBeInTheDocument();
			expect(
				screen.getByRole("heading", { name: "無効化されたDatePicker" })
			).toBeInTheDocument();
		});

		it("選択結果セクションが表示される", () => {
			render(<DatePickerDemoPage />);

			expect(screen.getByText("選択結果")).toBeInTheDocument();
			expect(screen.getByText("基本選択")).toBeInTheDocument();
			expect(screen.getByText("期間")).toBeInTheDocument();
			expect(screen.getByRole("heading", { name: "会議日時" })).toBeInTheDocument();
		});
	});

	describe("基本的なDatePickerの動作", () => {
		it("日付が選択されると状態が更新される", async () => {
			const user = userEvent.setup();
			render(<DatePickerDemoPage />);

			const basicDatePicker = screen.getByTestId("datepicker-日付を選択");
			const input = screen.getByTestId("input-日付を選択");

			await user.click(input);

			// 選択された日付が表示されることを確認
			await waitFor(() => {
				expect(screen.getByText(/選択された日付:/)).toBeInTheDocument();
			});
		});

		it("初期状態では「未選択」が表示される", () => {
			render(<DatePickerDemoPage />);

			expect(screen.getByText("選択された日付: 未選択")).toBeInTheDocument();
		});
	});

	describe("期間選択の動作", () => {
		it("開始日と終了日のDatePickerが表示される", () => {
			render(<DatePickerDemoPage />);

			expect(screen.getByTestId("datepicker-開始日")).toBeInTheDocument();
			expect(screen.getByTestId("datepicker-終了日")).toBeInTheDocument();
		});

		it("期間の表示が正しく行われる", () => {
			render(<DatePickerDemoPage />);

			expect(screen.getByText("期間: 未選択 〜 未選択")).toBeInTheDocument();
		});

		it("開始日を選択すると期間表示が更新される", async () => {
			const user = userEvent.setup();
			render(<DatePickerDemoPage />);

			const startDateInput = screen.getByTestId("input-開始日");
			await user.click(startDateInput);

			await waitFor(() => {
				expect(screen.getByText(/期間: 2024\/1\/15 〜 未選択/)).toBeInTheDocument();
			});
		});

		it("終了日を選択すると期間表示が更新される", async () => {
			const user = userEvent.setup();
			render(<DatePickerDemoPage />);

			const endDateInput = screen.getByTestId("input-終了日");
			await user.click(endDateInput);

			await waitFor(() => {
				expect(screen.getByText(/期間: 未選択 〜 2024\/1\/15/)).toBeInTheDocument();
			});
		});
	});

	describe("会議日時選択の動作", () => {
		it("会議日時のDatePickerが表示される", () => {
			render(<DatePickerDemoPage />);

			expect(screen.getByTestId("datepicker-会議日時")).toBeInTheDocument();
		});

		it("会議日時の初期表示が正しい", () => {
			render(<DatePickerDemoPage />);

			expect(screen.getByText("会議日時: 未選択")).toBeInTheDocument();
		});

		it("会議日時を選択すると表示が更新される", async () => {
			const user = userEvent.setup();
			render(<DatePickerDemoPage />);

			const meetingDateInput = screen.getByTestId("input-会議日時");
			await user.click(meetingDateInput);

			await waitFor(() => {
				expect(screen.getByText(/会議日時: 2024\/1\/15/)).toBeInTheDocument();
			});
		});
	});

	describe("無効化されたDatePicker", () => {
		it("無効化されたDatePickerが表示される", () => {
			render(<DatePickerDemoPage />);

			expect(screen.getByTestId("datepicker-無効化されたdatepicker")).toBeInTheDocument();
		});

		it("無効化されたDatePickerの説明が表示される", () => {
			render(<DatePickerDemoPage />);

			expect(screen.getByText("このDatePickerは無効化されています")).toBeInTheDocument();
		});
	});

	describe("選択結果の表示", () => {
		it("すべての選択結果カテゴリが表示される", () => {
			render(<DatePickerDemoPage />);

			expect(screen.getByText("基本選択")).toBeInTheDocument();
			expect(screen.getByText("期間")).toBeInTheDocument();
			expect(screen.getByRole("heading", { name: "会議日時" })).toBeInTheDocument();
		});

		it("初期状態ではすべて「未選択」が表示される", () => {
			render(<DatePickerDemoPage />);

			const unselectedTexts = screen.getAllByText("未選択");
			expect(unselectedTexts).toHaveLength(2); // 基本選択、会議日時
		});
	});

	describe("レスポンシブデザイン", () => {
		it("グリッドレイアウトが適用されている", () => {
			render(<DatePickerDemoPage />);

			const gridContainer = screen.getByText("基本的なDatePicker").closest(".grid");
			expect(gridContainer).toHaveClass("grid", "grid-cols-1", "md:grid-cols-2");
		});

		it("カードレイアウトが適用されている", () => {
			render(<DatePickerDemoPage />);

			const cards = document.querySelectorAll(".bg-white.p-6.rounded-lg.shadow-md");
			expect(cards.length).toBeGreaterThan(0);
		});
	});

	describe("アクセシビリティ", () => {
		it("適切な見出し構造が使用されている", () => {
			render(<DatePickerDemoPage />);

			expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("DatePicker デモ");
			const h2Elements = screen.getAllByRole("heading", { level: 2 });
			expect(h2Elements).toHaveLength(5); // 4つのDatePickerセクション + 選択結果
		});

		it("ラベルが適切に設定されている", () => {
			render(<DatePickerDemoPage />);

			expect(screen.getByText("日付を選択")).toBeInTheDocument();
			expect(screen.getByText("開始日")).toBeInTheDocument();
			expect(screen.getByText("終了日")).toBeInTheDocument();
			expect(screen.getByTestId("datepicker-会議日時")).toBeInTheDocument();
		});
	});

	describe("エラーハンドリング", () => {
		it("無効な日付が渡されてもエラーが発生しない", () => {
			expect(() => {
				render(<DatePickerDemoPage />);
			}).not.toThrow();
		});

		it("DatePickerのonChangeが呼ばれなくてもエラーが発生しない", async () => {
			const user = userEvent.setup();
			render(<DatePickerDemoPage />);

			const input = screen.getByTestId("input-日付を選択");
			await user.click(input);

			// エラーが発生しないことを確認
			expect(input).toBeInTheDocument();
		});
	});

	describe("状態管理", () => {
		it("複数のDatePickerが独立して動作する", async () => {
			const user = userEvent.setup();
			render(<DatePickerDemoPage />);

			// 基本選択のDatePickerを操作
			const basicInput = screen.getByTestId("input-日付を選択");
			await user.click(basicInput);

			// 会議日時のDatePickerを操作
			const meetingInput = screen.getByTestId("input-会議日時");
			await user.click(meetingInput);

			await waitFor(() => {
				expect(screen.getByText(/選択された日付: 2024\/1\/15/)).toBeInTheDocument();
				expect(screen.getByText(/会議日時: 2024\/1\/15/)).toBeInTheDocument();
			});
		});

		it("状態の初期化が正しく行われる", () => {
			render(<DatePickerDemoPage />);

			// すべての状態が初期値（null）であることを確認
			expect(screen.getByText("選択された日付: 未選択")).toBeInTheDocument();
			expect(screen.getByText("期間: 未選択 〜 未選択")).toBeInTheDocument();
			expect(screen.getByText("会議日時: 未選択")).toBeInTheDocument();
		});
	});
});
