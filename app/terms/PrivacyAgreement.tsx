"use client";

import React, { useMemo, useState } from "react";
import { Button, Checkbox, Typography, Space, Card } from "antd";
import type { PolicyGroup, Clause } from "./privacyData";

/**
 * データ同意
 */
export type PrivacyAgreementProps = {
	group: PolicyGroup;
	onAgreeSelected: (selectedClauses: Clause[]) => void;
	onDisagreeAll: () => void;
};

export function PrivacyAgreement({ group, onAgreeSelected, onDisagreeAll }: PrivacyAgreementProps) {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const toggle = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const clearSelection = () => setSelectedIds(new Set());

	const selectedClauses = useMemo(
		() => group.clauses.filter((c) => selectedIds.has(c.id)),
		[group.clauses, selectedIds]
	);

	const hasSelection = selectedClauses.length > 0;
	const isEmpty = group.clauses.length === 0;

	return (
		<section
			aria-labelledby={`policy-${group.id}-title`}
			className="max-w-2xl mx-auto"
			style={{
				backgroundImage: "url('/dataAgreement.jpg')",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
				padding: 24,
				borderRadius: 12,
			}}
		>
			<div style={{ backgroundColor: "#ffffff", borderRadius: 8, padding: 16 }}>
				<Typography.Title
					id={`policy-${group.id}-title`}
					level={2}
					style={{ textAlign: "center", marginBottom: 8 }}
				>
					{group.title}
				</Typography.Title>
				{group.description ? (
					<Typography.Paragraph style={{ marginTop: 8 }}>
						{group.description}
					</Typography.Paragraph>
				) : null}

				{isEmpty ? (
					<Typography.Text type="secondary">表示できる項目がありません。</Typography.Text>
				) : (
					<Card size="small" style={{ marginTop: 16 }} bodyStyle={{ padding: 12 }}>
						<Space direction="vertical" size={8} style={{ width: "100%" }}>
							{group.clauses.map((clause) => {
								const checked = selectedIds.has(clause.id);
								return (
									<div key={clause.id}>
										<Checkbox
											checked={checked}
											onChange={() => toggle(clause.id)}
										>
											{clause.label}
										</Checkbox>
										{clause.details ? (
											<Typography.Text
												type="secondary"
												style={{ display: "block", marginLeft: 26 }}
											>
												{clause.details}
											</Typography.Text>
										) : null}
									</div>
								);
							})}
						</Space>
					</Card>
				)}

				{group.policySections && group.policySections.length > 0 ? (
					<article
						aria-label={`${group.title}の本文`}
						className="mt-6 pt-4"
						style={{ maxHeight: "30vh", overflowY: "auto" }}
					>
						<Typography.Title level={5} style={{ marginBottom: 8 }}>
							ポリシー本文
						</Typography.Title>
						<Space direction="vertical" size={12} style={{ width: "100%" }}>
							{group.policySections.map((sec) => (
								<section key={sec.id}>
									{sec.heading ? (
										<Typography.Title level={5} style={{ marginBottom: 4 }}>
											{sec.heading}
										</Typography.Title>
									) : null}
									<Typography.Paragraph
										style={{ margin: 0, whiteSpace: "pre-wrap" }}
									>
										{sec.body}
									</Typography.Paragraph>
								</section>
							))}
						</Space>
					</article>
				) : null}

				<div className="mt-6">
					<Space size={12} style={{ width: "100%", justifyContent: "center" }}>
						<Button
							size="large"
							onClick={() => {
								clearSelection();
								onDisagreeAll();
							}}
							style={{ width: 240, paddingTop: 20, paddingBottom: 20 }}
							aria-label="全て同意しない"
						>
							全て同意しない
						</Button>
						<Button
							type="primary"
							size="large"
							onClick={() => onAgreeSelected(selectedClauses)}
							disabled={!hasSelection || isEmpty}
							style={{
								width: 240,
								whiteSpace: "normal",
								lineHeight: 1.2,
								paddingTop: 20,
								paddingBottom: 20,
							}}
							aria-label="✓をつけた項目について 同意する"
						>
							<span style={{ display: "inline-block", textAlign: "center" }}>
								<span style={{ display: "block", fontSize: 12 }}>
									✓をつけた項目について
								</span>
								<span style={{ display: "block", fontSize: 18 }}>同意する</span>
							</span>
						</Button>
					</Space>
				</div>
			</div>
		</section>
	);
}

export default PrivacyAgreement;
