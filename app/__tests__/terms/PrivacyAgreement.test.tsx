import { render, screen, fireEvent } from "@testing-library/react";
import { PrivacyAgreement } from "@/app/terms/PrivacyAgreement";
import type { PolicyGroup, Clause } from "@/app/terms/privacyData";

const sampleGroup: PolicyGroup = {
	id: "privacy",
	title: "プライバシーポリシー",
	description: "説明テキスト",
	clauses: [
		{ id: "a", label: "A に同意", details: "Aの詳細" },
		{ id: "b", label: "B に同意" },
		{ id: "c", label: "C に同意" },
	],
	policySections: [
		{ id: "s1", body: "本ポリシーは個人情報の取扱いを定めます。" },
		{ id: "s2", heading: "1. 利用目的", body: "サービス提供と品質向上のため利用します。" },
	],
};

describe("PrivacyAgreement", () => {
	it("選択した項目のみ onAgreeSelected に渡される", () => {
		const onAgree = jest.fn();
		const onDisagree = jest.fn();

		render(
			<PrivacyAgreement
				group={sampleGroup}
				onAgreeSelected={onAgree}
				onDisagreeAll={onDisagree}
			/>
		);

		fireEvent.click(screen.getByLabelText("A に同意"));
		fireEvent.click(screen.getByLabelText("C に同意"));
		fireEvent.click(screen.getByRole("button", { name: "✓をつけた項目について 同意する" }));

		expect(onAgree).toHaveBeenCalledTimes(1);
		const passed = onAgree.mock.calls[0][0] as Clause[];
		expect(passed.map((p) => p.id).sort()).toEqual(["a", "c"]);
	});

	it("未選択時は同意ボタンが非活性でハンドラは呼ばれない", () => {
		const onAgree = jest.fn();
		const onDisagree = jest.fn();

		render(
			<PrivacyAgreement
				group={sampleGroup}
				onAgreeSelected={onAgree}
				onDisagreeAll={onDisagree}
			/>
		);

		const agreeBtn = screen.getByRole("button", { name: "✓をつけた項目について 同意する" });
		expect(agreeBtn).toBeDisabled();
		fireEvent.click(agreeBtn);
		expect(onAgree).not.toHaveBeenCalled();
	});

	it("項目が空の場合、メッセージ表示と同意ボタン非活性", () => {
		const onAgree = jest.fn();
		const onDisagree = jest.fn();
		const emptyGroup: PolicyGroup = {
			id: "privacy",
			title: "プライバシーポリシー",
			description: "説明テキスト",
			clauses: [],
			policySections: [],
		};

		render(
			<PrivacyAgreement
				group={emptyGroup}
				onAgreeSelected={onAgree}
				onDisagreeAll={onDisagree}
			/>
		);

		expect(screen.getByText("表示できる項目がありません。")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "✓をつけた項目について 同意する" })
		).toBeDisabled();
	});

	it("チェックボックス群の下にポリシー本文が表示される", () => {
		render(
			<PrivacyAgreement
				group={sampleGroup}
				onAgreeSelected={jest.fn()}
				onDisagreeAll={jest.fn()}
			/>
		);
		expect(screen.getByRole("heading", { name: "ポリシー本文" })).toBeInTheDocument();
		expect(screen.getByText("本ポリシーは個人情報の取扱いを定めます。")).toBeInTheDocument();
		expect(screen.getByText("サービス提供と品質向上のため利用します。")).toBeInTheDocument();
	});

	it("全て同意しない で選択がクリアされ onDisagreeAll が呼ばれる", () => {
		const onAgree = jest.fn();
		const onDisagree = jest.fn();

		render(
			<PrivacyAgreement
				group={sampleGroup}
				onAgreeSelected={onAgree}
				onDisagreeAll={onDisagree}
			/>
		);

		fireEvent.click(screen.getByLabelText("B に同意"));
		fireEvent.click(screen.getByRole("button", { name: "全て同意しない" }));
		expect(onDisagree).toHaveBeenCalledTimes(1);

		expect(
			screen.getByRole("button", { name: "✓をつけた項目について 同意する" })
		).toBeDisabled();
	});
});
