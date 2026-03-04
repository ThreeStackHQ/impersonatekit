import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold tracking-tight">ImpersonateKit</h1>
      <p className="max-w-md text-center text-slate-400">
        Secure user impersonation for SaaS support teams. One-click login as
        any user with full audit trail.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-indigo-500 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-600"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-lg border border-slate-700 px-6 py-3 font-medium text-slate-300 transition-colors hover:border-slate-500"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
