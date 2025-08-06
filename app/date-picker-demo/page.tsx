"use client";

import React, { useState } from "react";
import CustomDatePicker from "../ui/date-picker";

export default function DatePickerDemoPage() {
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [meetingDate, setMeetingDate] = useState<Date | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);

	const handleStartDateChange = (date: Date | null) => {
		setStartDate(date);
	};

	const handleEndDateChange = (date: Date | null) => {
		setEndDate(date);
	};

	const handleMeetingDateChange = (date: Date | null) => {
		setMeetingDate(date);
	};

	const handleDateChange = (date: Date | null) => {
		setSelectedDate(date);
	};

	const formatDate = (date: Date | null) => {
		if (!date) return "未選択";
		return date.toLocaleDateString("ja-JP");
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">DatePicker デモ</h1>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* 基本的なDatePicker */}
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-xl font-semibold mb-4">基本的なDatePicker</h2>
						<CustomDatePicker
							label="日付を選択"
							placeholder="日付を選択してください"
							onChange={handleDateChange}
							selected={selectedDate}
						/>
						<div className="mt-4 p-3 bg-gray-100 rounded">
							<p className="text-sm text-gray-600">
								選択された日付: {formatDate(selectedDate)}
							</p>
						</div>
					</div>

					{/* 期間選択 */}
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-xl font-semibold mb-4">期間選択</h2>
						<div className="space-y-4">
							<CustomDatePicker
								label="開始日"
								placeholder="開始日を選択"
								onChange={handleStartDateChange}
								selected={startDate}
								maxDate={endDate || undefined}
							/>
							<CustomDatePicker
								label="終了日"
								placeholder="終了日を選択"
								onChange={handleEndDateChange}
								selected={endDate}
								minDate={startDate || undefined}
							/>
						</div>
						<div className="mt-4 p-3 bg-gray-100 rounded">
							<p className="text-sm text-gray-600">
								期間: {formatDate(startDate)} 〜 {formatDate(endDate)}
							</p>
						</div>
					</div>

					{/* 会議日時選択 */}
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-xl font-semibold mb-4">会議日時選択</h2>
						<CustomDatePicker
							label="会議日時"
							placeholder="会議日時を選択"
							onChange={handleMeetingDateChange}
							selected={meetingDate}
							showTimeSelect={true}
							dateFormat="yyyy/MM/dd HH:mm"
							minDate={new Date()}
						/>
						<div className="mt-4 p-3 bg-gray-100 rounded">
							<p className="text-sm text-gray-600">
								会議日時:{" "}
								{meetingDate ? meetingDate.toLocaleString("ja-JP") : "未選択"}
							</p>
						</div>
					</div>

					{/* 無効化されたDatePicker */}
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-xl font-semibold mb-4">無効化されたDatePicker</h2>
						<CustomDatePicker
							label="無効化されたDatePicker"
							placeholder="このDatePickerは無効化されています"
							onChange={() => {}}
							selected={null}
							disabled={true}
						/>
						<div className="mt-4 p-3 bg-gray-100 rounded">
							<p className="text-sm text-gray-600">
								このDatePickerは無効化されています
							</p>
						</div>
					</div>
				</div>

				{/* 選択結果の表示 */}
				<div className="mt-8 bg-white p-6 rounded-lg shadow-md">
					<h2 className="text-xl font-semibold mb-4">選択結果</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h3 className="font-medium text-gray-700">基本選択</h3>
							<p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
						</div>
						<div>
							<h3 className="font-medium text-gray-700">期間</h3>
							<p className="text-sm text-gray-600">
								{formatDate(startDate)} 〜 {formatDate(endDate)}
							</p>
						</div>
						<div>
							<h3 className="font-medium text-gray-700">会議日時</h3>
							<p className="text-sm text-gray-600">
								{meetingDate ? meetingDate.toLocaleString("ja-JP") : "未選択"}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
