"use client";

import { useState } from "react";

export default function Page() {
  const [key1, setKey1] = useState("");
  const [key2, setKey2] = useState("");
  const [key3, setKey3] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // CognitoのIDトークンをlocalStorageなどから取得する想定
  const getAuthToken = () => {
    return localStorage.getItem("idToken") || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL +
          "/sample2?" +
          new URLSearchParams({ key1, key2, key3 }),
        {
          method: "GET",
          headers: {
            Authorization: getAuthToken(),
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      if (!res.ok) {
        // API Gatewayのエラーメッセージも表示
        let msg = `API Error: ${res.status}`;
        try {
          const errJson = await res.json();
          msg += errJson.message ? `: ${errJson.message}` : "";
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || "APIリクエスト失敗");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Sample2 APIテスト</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="key1"
          value={key1}
          onChange={(e) => setKey1(e.target.value)}
          className="border px-2 py-1"
        />
        <input
          type="text"
          placeholder="key2"
          value={key2}
          onChange={(e) => setKey2(e.target.value)}
          className="border px-2 py-1"
        />
        <input
          type="text"
          placeholder="key3"
          value={key3}
          onChange={(e) => setKey3(e.target.value)}
          className="border px-2 py-1"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          送信
        </button>
      </form>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {response && (
        <div className="mt-2">
          <div className="font-bold">APIレスポンス:</div>
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
