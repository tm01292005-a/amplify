import SignupForm from "../ui/signup-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">サインアップ</h1>
        <SignupForm />
      </div>
    </main>
  );
}
