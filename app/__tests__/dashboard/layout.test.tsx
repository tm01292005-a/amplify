import React from "react";
import { render, screen } from "@testing-library/react";
import Layout from "@/app/dashboard/layout";

// SideNavをモック化
jest.mock("@/app/ui/dashboard/sidenav", () => () => <nav data-testid="sidenav">サイドナビ</nav>);

describe("Dashboard Layout", () => {
	it("SideNavとchildrenが正しく描画される", () => {
		render(
			<Layout>
				<div data-testid="child">テスト用子要素</div>
			</Layout>
		);
		// SideNavが表示される
		expect(screen.getByTestId("sidenav")).toBeInTheDocument();
		// childrenが表示される
		expect(screen.getByTestId("child")).toHaveTextContent("テスト用子要素");
	});

	it("レイアウトのクラス構造が正しい", () => {
		const { container } = render(
			<Layout>
				<div>dummy</div>
			</Layout>
		);
		// ルートdivのクラス
		expect(container.firstChild).toHaveClass("flex", "h-screen", "flex-col");
		// SideNavラッパーのクラス
		expect(container.querySelector(".w-full.flex-none.md\\:w-64")).toBeTruthy();
		// childrenラッパーのクラス
		expect(
			container.querySelector(".flex-grow.p-6.md\\:overflow-y-auto.md\\:p-12")
		).toBeTruthy();
	});
});
