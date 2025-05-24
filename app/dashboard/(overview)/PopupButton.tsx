"use client";

import { useState } from "react";

// ポップアップ本体
function Popup({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
      <div className="relative bg-white rounded-lg shadow-lg p-8 min-w-[300px]">
        {/* 右上の✖ボタン */}
        <button
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
        <div className="mb-4">{message}</div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-400"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

// ボタン＋ポップアップ制御
export default function PopupButton() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-400"
        onClick={() => setShow(true)}
      >
        ポップアップを表示
      </button>
      {show && (
        <Popup
          message="これはポップアップのサンプルです。"
          onClose={() => setShow(false)}
        />
      )}
    </>
  );
}
