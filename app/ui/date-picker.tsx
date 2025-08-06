"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
	label?: string;
	placeholder?: string;
	onChange?: (date: Date | null) => void;
	selected?: Date | null;
	disabled?: boolean;
	minDate?: Date;
	maxDate?: Date;
	showTimeSelect?: boolean;
	dateFormat?: string;
	className?: string;
}

export const CustomDatePicker: React.FC<DatePickerProps> = ({
	label = "日付を選択",
	placeholder = "日付を選択してください",
	onChange,
	selected,
	disabled = false,
	minDate,
	maxDate,
	showTimeSelect = false,
	dateFormat = "yyyy/MM/dd",
	className = "",
}) => {
	const [internalDate, setInternalDate] = useState<Date | null>(selected || null);

	const handleDateChange = (date: Date | null) => {
		setInternalDate(date);
		if (onChange) {
			onChange(date);
		}
	};

	return (
		<div className={`date-picker-container ${className}`}>
			{label && (
				<label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
			)}
			<DatePicker
				selected={selected || internalDate}
				onChange={handleDateChange}
				placeholderText={placeholder}
				disabled={disabled}
				minDate={minDate}
				maxDate={maxDate}
				showTimeSelect={showTimeSelect}
				dateFormat={dateFormat}
				className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
				wrapperClassName="w-full"
			/>
		</div>
	);
};

export default CustomDatePicker;
