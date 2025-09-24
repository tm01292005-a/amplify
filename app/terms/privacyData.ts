import { z } from "zod";

/**
 * データ同意の個別項目（チェックボックス1つ分）
 */
export const ClauseSchema = z.object({
	id: z.string().min(1),
	label: z.string().min(1),
	details: z.string().optional(),
});
export type Clause = z.infer<typeof ClauseSchema>;

/** データ同意の本文セクション */
export const PolicySectionSchema = z.object({
	id: z.string().min(1),
	heading: z.string().optional(),
	body: z.string().min(1),
});
export type PolicySection = z.infer<typeof PolicySectionSchema>;

/** データ同意グループ */
export const PolicyGroupSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	description: z.string().optional(),
	clauses: z.array(ClauseSchema),
	policySections: z.array(PolicySectionSchema).default([]),
});
export type PolicyGroup = z.infer<typeof PolicyGroupSchema>;

/**
 * データ同意の定義
 * - 項目の増減は clauses の配列を編集してください
 */
export const privacyPolicyGroup: PolicyGroup = {
	id: "privacy-policy",
	title: "データ同意",
	description:
		"当社は、サービス提供に必要な範囲でお客様の個人情報を取り扱います。以下の各項目をご確認ください。",
	clauses: [
		{
			id: "collect",
			label: "個人情報の収集・利用目的に同意します",
			details: "ご利用登録、サポート対応、品質改善のために必要な範囲で収集・利用します。",
		},
		{
			id: "third-party",
			label: "第三者提供に関する方針に同意します",
			details: "法令に基づく場合等を除き、同意なく第三者に提供しません。",
		},
		{
			id: "analytics",
			label: "アクセス解析（クッキー等）の利用に同意します（任意）",
			details: "利用状況の把握と機能改善のため解析ツールを利用します。",
		},
	],
	policySections: [
		{
			id: "intro",
			body: "本ポリシーは、当社が取得する個人情報の種類、利用目的、第三者提供、安全管理措置、開示・訂正・利用停止の手続等について定めるものです。",
		},
		{
			id: "purpose",
			heading: "1. 利用目的",
			body: "当社は、サービス提供、本人確認、サポート対応、品質向上、法令遵守のために個人情報を利用します。",
		},
		{
			id: "rights",
			heading: "2. お客様の権利",
			body: "お客様は、当社が保有する自身の個人情報について、開示・訂正・削除・利用停止を請求できます。詳しくはお問い合わせ窓口までご連絡ください。",
		},
		{
			id: "rights",
			heading: "2. お客様の権利",
			body: "お客様は、当社が保有する自身の個人情報について、開示・訂正・削除・利用停止を請求できます。詳しくはお問い合わせ窓口までご連絡ください。",
		},
		{
			id: "rights",
			heading: "2. お客様の権利",
			body: "お客様は、当社が保有する自身の個人情報について、開示・訂正・削除・利用停止を請求できます。詳しくはお問い合わせ窓口までご連絡ください。",
		},
		{
			id: "rights",
			heading: "2. お客様の権利",
			body: "お客様は、当社が保有する自身の個人情報について、開示・訂正・削除・利用停止を請求できます。詳しくはお問い合わせ窓口までご連絡ください。",
		},
	],
};
