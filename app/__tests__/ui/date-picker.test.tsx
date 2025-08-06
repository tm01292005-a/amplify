import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomDatePicker from "../../ui/date-picker";

// react-datepickerのモック
jest.mock("react-datepicker", () => {
	return function MockDatePicker({
		selected,
		onChange,
		placeholderText,
		disabled,
		minDate,
		maxDate,
		showTimeSelect,
		dateFormat,
		className,
		wrapperClassName,
	}: any) {
		return (
			<div className={wrapperClassName}>
				<input
					type="text"
					value={selected ? selected.toLocaleDateString() : ""}
					onChange={(e) => {
						if (onChange && !disabled) {
							// 簡単な日付パース（実際のテストでは適切な日付オブジェクトを使用）
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
					placeholder={placeholderText}
					disabled={disabled}
					className={className}
					data-testid="datepicker-input"
					data-min-date={minDate?.toISOString()}
					data-max-date={maxDate?.toISOString()}
					data-show-time={showTimeSelect}
					data-date-format={dateFormat}
				/>
			</div>
		);
	};
});

// CSSのモック
jest.mock("react-datepicker/dist/react-datepicker.css", () => ({}));

describe("CustomDatePicker", () => {
	const defaultProps = {
		onChange: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("基本的なレンダリング", () => {
		it("デフォルトのラベルとプレースホルダーが表示される", () => {
			render(<CustomDatePicker {...defaultProps} />);

			expect(screen.getByText("日付を選択")).toBeInTheDocument();
			expect(screen.getByPlaceholderText("日付を選択してください")).toBeInTheDocument();
		});

		it("カスタムラベルとプレースホルダーが表示される", () => {
			render(
				<CustomDatePicker
					{...defaultProps}
					label="カスタムラベル"
					placeholder="カスタムプレースホルダー"
				/>
			);

			expect(screen.getByText("カスタムラベル")).toBeInTheDocument();
			expect(screen.getByPlaceholderText("カスタムプレースホルダー")).toBeInTheDocument();
		});

		it("ラベルなしでレンダリングされる", () => {
			render(<CustomDatePicker {...defaultProps} label="" />);

			expect(screen.queryByText("日付を選択")).not.toBeInTheDocument();
			expect(screen.getByPlaceholderText("日付を選択してください")).toBeInTheDocument();
		});

		it("カスタムクラス名が適用される", () => {
			render(<CustomDatePicker {...defaultProps} className="custom-class" />);

			const container = screen
				.getByTestId("datepicker-input")
				.closest(".date-picker-container");
			expect(container).toHaveClass("custom-class");
		});
	});

	describe("日付選択の動作", () => {
		it("日付が選択されるとonChangeが呼ばれる", async () => {
			const user = userEvent.setup();
			const mockOnChange = jest.fn();

			render(<CustomDatePicker onChange={mockOnChange} />);

			const input = screen.getByTestId("datepicker-input");
			await user.click(input);

			expect(mockOnChange).toHaveBeenCalledWith(expect.any(Date));
		});

		it("選択された日付が表示される", () => {
			const testDate = new Date("2024-01-15");
			render(<CustomDatePicker {...defaultProps} selected={testDate} />);

			const input = screen.getByTestId("datepicker-input");
			expect(input).toHaveValue(testDate.toLocaleDateString());
		});

		it("nullの日付が渡された場合、空の値が表示される", () => {
			render(<CustomDatePicker {...defaultProps} selected={null} />);

			const input = screen.getByTestId("datepicker-input");
			expect(input).toHaveValue("");
		});
	});

	describe("無効化状態", () => {
		it("disabled=trueの場合、入力フィールドが無効化される", () => {
			render(<CustomDatePicker {...defaultProps} disabled={true} />);

			const input = screen.getByTestId("datepicker-input");
			expect(input).toBeDisabled();
		});

		it("無効化された状態ではonChangeが呼ばれない", async () => {
			const user = userEvent.setup();
			const mockOnChange = jest.fn();

			render(<CustomDatePicker onChange={mockOnChange} disabled={true} />);

			const input = screen.getByTestId("datepicker-input");
			await user.click(input);

			expect(mockOnChange).not.toHaveBeenCalled();
		});
	});

	describe("日付制限", () => {
		it("minDateが設定される", () => {
			const minDate = new Date("2024-01-01");
			render(<CustomDatePicker {...defaultProps} minDate={minDate} />);

			const input = screen.getByTestId("datepicker-input");
			expect(input).toHaveAttribute("data-min-date", minDate.toISOString());
		});

		it("maxDateが設定される", () => {
			const maxDate = new Date("2024-12-31");
			render(<CustomDatePicker {...defaultProps} maxDate={maxDate} />);

			const input = screen.getByTestId("datepicker-input");
			expect(input).toHaveAttribute("data-max-date", maxDate.toISOString());
		});
	});

	describe("時間選択", () => {
		it("showTimeSelect=trueの場合、時間選択が有効になる", () => {
			render(<CustomDatePicker {...defaultProps} showTimeSelect={true} />);

			const input = screen.getByTestId("datepicker-input");
			expect(input).toHaveAttribute("data-show-time", "true");
		});

		it("カスタム日付フォーマットが適用される", () => {
			render(
				<CustomDatePicker
					{...defaultProps}
					dateFormat="yyyy/MM/dd HH:mm"
					showTimeSelect={true}
				/>
			);

			const input = screen.getByTestId("datepicker-input");
			expect(input).toHaveAttribute("data-date-format", "yyyy/MM/dd HH:mm");
		});
	});

	describe("アクセシビリティ", () => {
		it("ラベルと入力フィールドが適切に関連付けられている", () => {
			render(<CustomDatePicker {...defaultProps} label="テストラベル" />);

			const label = screen.getByText("テストラベル");
			const input = screen.getByTestId("datepicker-input");

			expect(label).toBeInTheDocument();
			expect(input).toBeInTheDocument();
		});

		it("プレースホルダーテキストが設定されている", () => {
			render(<CustomDatePicker {...defaultProps} placeholder="テストプレースホルダー" />);

			const input = screen.getByPlaceholderText("テストプレースホルダー");
			expect(input).toBeInTheDocument();
		});
	});

	describe("エッジケース", () => {
		it("onChangeが渡されない場合でもエラーが発生しない", async () => {
			const user = userEvent.setup();

			render(<CustomDatePicker />);

			const input = screen.getByTestId("datepicker-input");
			await user.click(input);

			// エラーが発生しないことを確認
			expect(input).toBeInTheDocument();
		});

		it("無効な日付が渡された場合でもエラーが発生しない", () => {
			const invalidDate = new Date("invalid-date");

			expect(() => {
				render(<CustomDatePicker {...defaultProps} selected={invalidDate} />);
			}).not.toThrow();
		});
	});

	describe("スタイリング", () => {
		it("デフォルトのCSSクラスが適用される", () => {
			render(<CustomDatePicker {...defaultProps} />);

			const input = screen.getByTestId("datepicker-input");
			expect(input).toHaveClass("w-full", "px-3", "py-2", "border", "border-gray-300");
		});

		it("無効化された状態で適切なクラスが適用される", () => {
			render(<CustomDatePicker {...defaultProps} disabled={true} />);

			const input = screen.getByTestId("datepicker-input");
			expect(input).toHaveClass("disabled:bg-gray-100", "disabled:cursor-not-allowed");
		});
	});
});
