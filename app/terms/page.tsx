"use client";

import React from "react";
import { PrivacyAgreement } from "./PrivacyAgreement";
import { privacyPolicyGroup } from "./privacyData";

/**
 * プライバシーポリシー同意ページ（単一グループ内に複数チェック項目）
 */
export default function TermsPage() {
	const handleAgreeSelected = (selected: typeof privacyPolicyGroup.clauses) => {
		console.log(`同意した項目: ${selected.map((s) => s.id).join(", ") || "なし"}`);
	};

	const handleDisagreeAll = () => {
		console.log("全て同意しませんでした");
	};

	return (
		<div className="p-6">
			<PrivacyAgreement
				group={privacyPolicyGroup}
				onAgreeSelected={handleAgreeSelected}
				onDisagreeAll={handleDisagreeAll}
			/>
		</div>
	);
}
