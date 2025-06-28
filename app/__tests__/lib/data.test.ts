import { Revenue } from "@/app/lib/definitions";

// sqlMockをグローバルに用意
const sqlMock = jest.fn();

// postgresモジュールのモック（必ずimportより前に実行）
jest.mock("postgres", () => {
	// postgres() の返り値がタグ付きテンプレート関数になるようにする
	return () => {
		const handler = ((...args: any[]) => sqlMock(...args)) as {
			(...args: any[]): any;
			[key: string]: any;
			[key: symbol]: any;
		};
		return new Proxy(handler, {
			// 型パラメータ付き呼び出し(sql<T>``)にも対応
			apply(target, thisArg, argArray) {
				return handler(...argArray);
			},
			get(target, prop) {
				return target[prop];
			},
		});
	};
});

import * as data from "@/app/lib/data";
import * as utils from "@/app/lib/utils";

describe("lib/data", () => {
	beforeEach(() => {
		sqlMock.mockReset();
		// テスト用にPOSTGRES_URLをダミーで設定
		process.env.POSTGRES_URL = "postgres://user:pass@localhost:5432/db";
	});

	// fetchRevenueの正常系
	it("fetchRevenue: 正常にデータを返す", async () => {
		const mockRevenue: Revenue[] = [{ month: "2024-06", revenue: 1000 }];
		sqlMock.mockResolvedValueOnce(mockRevenue);

		const result = await data.fetchRevenue();
		expect(result).toEqual(mockRevenue);
	});

	// fetchRevenueの異常系
	it("fetchRevenue: DBエラー時は例外を投げる", async () => {
		sqlMock.mockRejectedValueOnce(new Error("db error"));
		await expect(data.fetchRevenue()).rejects.toThrow("Failed to fetch revenue data.");
	});

	// fetchLatestInvoicesの正常系
	it("fetchLatestInvoices: 最新請求書を返す", async () => {
		const mockData = [{ amount: 1000, name: "A", image_url: "", email: "", id: "i1" }];
		sqlMock.mockResolvedValueOnce(mockData);

		// formatCurrencyをモック（プロパティ書き換え不可のため、jest.mockで上書き）
		jest.resetModules();
		jest.doMock("@/app/lib/utils", () => ({
			...jest.requireActual("@/app/lib/utils"),
			formatCurrency: (v: number) => `¥${v}`,
		}));
		const dataWithMock = await import("@/app/lib/data");

		const result = await dataWithMock.fetchLatestInvoices();
		expect(result[0].amount).toBe("¥1000");
	});

	// fetchInvoiceByIdの正常系
	it("fetchInvoiceById: 指定IDの請求書を返す", async () => {
		// amountは100の倍数（例: 200 → 2, 20000 → 200）
		const mockData = [{ id: "i1", customer_id: "c1", amount: 20000, status: "paid" }];
		sqlMock.mockResolvedValueOnce(mockData);

		const result = await data.fetchInvoiceById("i1");
		expect(result).toMatchObject({ id: "i1", amount: 200 });
	});

	// fetchCustomersの異常系
	it("fetchCustomers: DBエラー時は例外を投げる", async () => {
		sqlMock.mockRejectedValueOnce(new Error("db error"));
		await expect(data.fetchCustomers()).rejects.toThrow("Failed to fetch all customers.");
	});
});
