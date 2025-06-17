"use client";

import ResetPasswordForm from "@/app/ui/reset-password-form";
import AcmeLogo from "@/app/ui/acme-logo";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
        <AcmeLogo />
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <h1 className="text-2xl font-bold">パスワードのリセット</h1>
          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}
