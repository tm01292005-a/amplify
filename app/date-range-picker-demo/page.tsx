"use client";

import React, { useState } from "react";
import { DateRangePicker } from "../ui/date-range-picker";
import { SingleInputDateRangePickerSample } from "../ui/date-range-picker";
import { Box, Paper, Title, Text, Stack, Button, Alert } from "@mantine/core";

export default function DateRangePickerDemoPage() {
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
	const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
	const [constrainedStartDate, setConstrainedStartDate] = useState<Date | null>(null);
	const [constrainedEndDate, setConstrainedEndDate] = useState<Date | null>(null);
	const [errorStartDate, setErrorStartDate] = useState<Date | null>(null);
	const [errorEndDate, setErrorEndDate] = useState<Date | null>(null);

	const handleDateRangeChange = (start: Date | null, end: Date | null) => {
		setStartDate(start);
		setEndDate(end);
	};

	const handleCustomDateRangeChange = (start: Date | null, end: Date | null) => {
		setCustomStartDate(start);
		setCustomEndDate(end);
	};

	const handleConstrainedDateRangeChange = (start: Date | null, end: Date | null) => {
		setConstrainedStartDate(start);
		setConstrainedEndDate(end);
	};

	const handleErrorDateRangeChange = (start: Date | null, end: Date | null) => {
		setErrorStartDate(start);
		setErrorEndDate(end);
	};

	const formatDate = (date: Date | null) => {
		if (!date) return "未選択";
		return date.toLocaleDateString("ja-JP");
	};

	const getDateRangeText = (start: Date | null, end: Date | null) => {
		if (!start && !end) return "期間が選択されていません";
		if (start && end) {
			return `${formatDate(start)} 〜 ${formatDate(end)}`;
		}
		if (start) return `開始日: ${formatDate(start)}`;
		if (end) return `終了日: ${formatDate(end)}`;
		return "期間が選択されていません";
	};

	const minDate = new Date("2024-01-01");
	const maxDate = new Date("2024-12-31");

	return (
		<Box p="xl" bg="gray.0" mih="100vh">
			<Stack gap="xl" maw={1200} mx="auto">
				<Title order={1} ta="center" mb="lg">
					Mantine DateRangePicker デモ
				</Title>

				{/* 基本的なDateRangePicker */}
				<Paper p="xl" withBorder>
					<Title order={2} mb="md">
						基本的な期間選択
					</Title>
					<DateRangePicker
						label="期間を選択してください"
						onChange={handleDateRangeChange}
						startDate={startDate}
						endDate={endDate}
					/>
					<Alert mt="md" color="blue" variant="light">
						選択された期間: {getDateRangeText(startDate, endDate)}
					</Alert>
				</Paper>

				{/* カスタムラベルのDateRangePicker */}
				<Paper p="xl" withBorder>
					<Title order={2} mb="md">
						カスタムラベル
					</Title>
					<DateRangePicker
						label="プロジェクト期間"
						startDateLabel="プロジェクト開始日"
						endDateLabel="プロジェクト終了日"
						startDatePlaceholder="開始日を選択してください"
						endDatePlaceholder="終了日を選択してください"
						onChange={handleCustomDateRangeChange}
						startDate={customStartDate}
						endDate={customEndDate}
					/>
					<Alert mt="md" color="green" variant="light">
						プロジェクト期間: {getDateRangeText(customStartDate, customEndDate)}
					</Alert>
				</Paper>

				{/* 制約付きのDateRangePicker */}
				<Paper p="xl" withBorder>
					<Title order={2} mb="md">
						制約付き期間選択（2024年のみ）
					</Title>
					<DateRangePicker
						label="2024年の期間を選択"
						startDateLabel="開始日"
						endDateLabel="終了日"
						onChange={handleConstrainedDateRangeChange}
						startDate={constrainedStartDate}
						endDate={constrainedEndDate}
						minDate={minDate}
						maxDate={maxDate}
					/>
					<Alert mt="md" color="yellow" variant="light">
						選択された期間: {getDateRangeText(constrainedStartDate, constrainedEndDate)}
					</Alert>
				</Paper>

				{/* エラー表示のDateRangePicker */}
				<Paper p="xl" withBorder>
					<Title order={2} mb="md">
						エラー表示
					</Title>
					<DateRangePicker
						label="必須項目"
						onChange={handleErrorDateRangeChange}
						startDate={errorStartDate}
						endDate={errorEndDate}
						error={
							!errorStartDate || !errorEndDate
								? "開始日と終了日の両方を選択してください"
								: undefined
						}
					/>
					<Alert mt="md" color="red" variant="light">
						選択された期間: {getDateRangeText(errorStartDate, errorEndDate)}
					</Alert>
				</Paper>

				{/* 無効化されたDateRangePicker */}
				<Paper p="xl" withBorder>
					<Title order={2} mb="md">
						無効化された期間選択
					</Title>
					<DateRangePicker
						label="無効化されたDateRangePicker"
						onChange={() => {}}
						disabled={true}
					/>
					<Alert mt="md" color="gray" variant="light">
						このDateRangePickerは無効化されています
					</Alert>
				</Paper>

				{/* クリア機能なしのDateRangePicker */}
				<Paper p="xl" withBorder>
					<Title order={2} mb="md">
						クリア機能なし
					</Title>
					<DateRangePicker
						label="クリア機能なしの期間選択"
						onChange={() => {}}
						clearable={false}
					/>
					<Alert mt="md" color="blue" variant="light">
						このDateRangePickerはクリア機能が無効化されています
					</Alert>
				</Paper>

				{/* 選択結果のサマリー */}
				<Paper p="xl" withBorder>
					<Title order={2} mb="md">
						選択結果サマリー
					</Title>
					<Stack gap="md">
						<Box>
							<Text fw={500}>基本選択:</Text>
							<Text size="sm" c="dimmed">
								{getDateRangeText(startDate, endDate)}
							</Text>
						</Box>
						<Box>
							<Text fw={500}>カスタムラベル:</Text>
							<Text size="sm" c="dimmed">
								{getDateRangeText(customStartDate, customEndDate)}
							</Text>
						</Box>
						<Box>
							<Text fw={500}>制約付き:</Text>
							<Text size="sm" c="dimmed">
								{getDateRangeText(constrainedStartDate, constrainedEndDate)}
							</Text>
						</Box>
						<Box>
							<Text fw={500}>エラー表示:</Text>
							<Text size="sm" c="dimmed">
								{getDateRangeText(errorStartDate, errorEndDate)}
							</Text>
						</Box>
					</Stack>
				</Paper>

				{/* テスト用のボタン */}
				<Paper p="xl" withBorder>
					<Title order={2} mb="md">
						テスト用操作
					</Title>
					<Stack gap="md">
						<Button
							onClick={() => {
								setStartDate(new Date("2024-06-01"));
								setEndDate(new Date("2024-06-30"));
							}}
						>
							6月の期間を設定
						</Button>
						<Button
							onClick={() => {
								setStartDate(null);
								setEndDate(null);
							}}
							variant="outline"
						>
							期間をクリア
						</Button>
						<Button
							onClick={() => {
								setErrorStartDate(new Date("2024-01-01"));
								setErrorEndDate(new Date("2024-12-31"));
							}}
							color="green"
						>
							エラー表示を解決
						</Button>
					</Stack>
				</Paper>

				{/* 1つのDatePickerInputで期間選択サンプル */}
				<Paper p="xl" withBorder>
					<Title order={2} mb="md">
						1つのDatePickerInputで期間選択
					</Title>
					<SingleInputDateRangePickerSample />
				</Paper>
			</Stack>
		</Box>
	);
}
