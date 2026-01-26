import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import SignOutButton from "@/components/auth/SignOutButton";
import { authOptions } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/app/dashboard"
              className="text-lg font-semibold tracking-tight text-slate-900"
            >
              DSAIEngineeringGym
            </Link>
            <nav className="flex items-center gap-2 text-sm text-slate-600">
              <Link
                href="/app/dashboard"
                className="rounded-full px-3 py-1 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Dashboard
              </Link>
              <Link
                href="/app/courses"
                className="rounded-full px-3 py-1 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Courses
              </Link>
              <Link
                href="/app/review"
                className="rounded-full px-3 py-1 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Review
              </Link>
            </nav>
          </div>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
