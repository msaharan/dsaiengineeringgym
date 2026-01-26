import { getServerSession } from "next-auth";

import SignOutButton from "@/components/auth/SignOutButton";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Welcome{user?.name ? `, ${user.name}` : ""}.
          </h1>
          {user?.email ? (
            <p className="mt-2 text-sm text-slate-600">{user.email}</p>
          ) : null}
        </div>
        <SignOutButton />
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Your learning gym is warming up
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Next up: courses, lessons, and flashcard reviews.
        </p>
      </section>
    </main>
  );
}
