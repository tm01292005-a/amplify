"use client";

import React, { useState } from "react";
import { DatePickerInput } from "@mantine/dates";
import { Box, Group, Text } from "@mantine/core";

interface DateRangePickerProps {
	label?: string;
	startDateLabel?: string;
	endDateLabel?: string;
	startDatePlaceholder?: string;
	endDatePlaceholder?: string;
	onChange?: (startDate: Date | null, endDate: Date | null) => void;
	startDate?: Date | null;
	endDate?: Date | null;
	disabled?: boolean;
	minDate?: Date;
	maxDate?: Date;
	clearable?: boolean;
	className?: string;
	error?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
	label = "期間を選択",
	startDateLabel = "開始日",
	endDateLabel = "終了日",
	startDatePlaceholder = "開始日を選択",
	endDatePlaceholder = "終了日を選択",
	onChange,
	startDate,
	endDate,
	disabled = false,
	minDate,
	maxDate,
	clearable = true,
	className = "",
	error,
}) => {
	// useStateの型をstring | nullに
	const [internalStartDate, setInternalStartDate] = useState<string | null>(
		startDate ? startDate.toISOString() : null
	);
	const [internalEndDate, setInternalEndDate] = useState<string | null>(
		endDate ? endDate.toISOString() : null
	);

	// onChangeでDate型に変換してコールバック
	const handleStartDateChange = (dateStr: string | null) => {
		setInternalStartDate(dateStr);
		if (onChange) {
			onChange(
				dateStr ? new Date(dateStr) : null,
				internalEndDate ? new Date(internalEndDate) : null
			);
		}
	};
	const handleEndDateChange = (dateStr: string | null) => {
		setInternalEndDate(dateStr);
		if (onChange) {
			onChange(
				internalStartDate ? new Date(internalStartDate) : null,
				dateStr ? new Date(dateStr) : null
			);
		}
	};

	// 表示用Date型
	const currentStartDate = internalStartDate ? new Date(internalStartDate) : null;
	const currentEndDate = internalEndDate ? new Date(internalEndDate) : null;

	return (
		<Box className={`date-range-picker-container ${className}`}>
			{label && (
				<Text size="sm" fw={500} mb="xs">
					{label}
				</Text>
			)}

			<Group gap="md" align="flex-start">
				<DatePickerInput
					label={startDateLabel}
					placeholder={startDatePlaceholder}
					value={internalStartDate}
					onChange={handleStartDateChange}
					disabled={disabled}
					minDate={minDate}
					maxDate={currentEndDate || maxDate}
					clearable={clearable}
					valueFormat="YYYY/MM/DD"
					data-testid="start-date-picker"
					// @ts-ignore 型エラー回避
				/>

				<DatePickerInput
					label={endDateLabel}
					placeholder={endDatePlaceholder}
					value={internalEndDate}
					onChange={handleEndDateChange}
					disabled={disabled}
					minDate={currentStartDate || minDate}
					maxDate={maxDate}
					clearable={clearable}
					valueFormat="YYYY/MM/DD"
					data-testid="end-date-picker"
					// @ts-ignore 型エラー回避
				/>
			</Group>

			{error && (
				<Text size="xs" c="red" mt="xs">
					{error}
				</Text>
			)}

			{currentStartDate && currentEndDate && (
				<Box mt="md" p="xs" bg="gray.0" style={{ borderRadius: 4 }}>
					<Text size="sm" c="dimmed">
						選択期間: {currentStartDate.toLocaleDateString("ja-JP")} 〜{" "}
						{currentEndDate.toLocaleDateString("ja-JP")}
					</Text>
				</Box>
			)}
		</Box>
	);
};

export default DateRangePicker;

// --- サンプル: 1つのDatePickerInputで期間選択 ---
export function SingleInputDateRangePickerSample() {
	const [range, setRange] = useState<[string | null, string | null]>([null, null]);

	// 日付をDate型に変換して表示
	const start = range[0] ? new Date(range[0]) : null;
	const end = range[1] ? new Date(range[1]) : null;

	return (
		<div style={{ maxWidth: 400, margin: "0 auto" }}>
			<DatePickerInput
				type="range"
				label="期間を選択"
				placeholder="開始日と終了日を選択"
				value={range}
				onChange={setRange}
				valueFormat="YYYY/MM/DD"
			/>
			<div style={{ marginTop: 16 }}>
				{start && end
					? `選択期間: ${start.toLocaleDateString("ja-JP")} 〜 ${end.toLocaleDateString("ja-JP")}`
					: "期間が選択されていません"}
			</div>
		</div>
	);
}

// --- サンプル: 選択範囲の色をカスタマイズ ---
export function CustomColorRangePickerSample() {
	const [range, setRange] = useState<[string | null, string | null]>([null, null]);
	const start = range[0] ? new Date(range[0]) : null;
	const end = range[1] ? new Date(range[1]) : null;

	return (
		<div style={{ maxWidth: 400, margin: "32px auto 0 auto" }}>
			<DatePickerInput
				type="range"
				label="カスタム色の期間選択"
				placeholder="開始日と終了日を選択"
				value={range}
				onChange={setRange}
				valueFormat="YYYY/MM/DD"
				styles={{
					day: (theme, { selected, inRange }) => ({
						...(selected && { backgroundColor: "#ffb347", color: "#fff" }), // オレンジ色
						...(inRange && { backgroundColor: "#ffe4b5", color: "#000" }), // 薄いオレンジ
					}),
				}}
			/>
			<div style={{ marginTop: 16 }}>
				{start && end
					? `選択期間: ${start.toLocaleDateString("ja-JP")} 〜 ${end.toLocaleDateString("ja-JP")}`
					: "期間が選択されていません"}
			</div>
		</div>
	);
}
