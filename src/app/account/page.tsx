"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#faf5f2] pt-32 pb-20">
        <div className="mx-auto flex w-full max-w-[120rem] flex-col items-center px-4 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[rgb(30,36,44)] sm:text-3xl">
            Account
          </h1>
          <p className="mt-4 text-sm text-zinc-600">
            You need to be signed in to view your account.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/signin"
              className="bg-[rgb(30,36,44)] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[rgb(40,48,58)]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="border border-zinc-400 px-5 py-3 text-sm font-medium text-[rgb(30,36,44)] transition-colors hover:bg-zinc-100"
            >
              Create account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf5f2] pt-32 pb-20">
      <div className="mx-auto w-full max-w-[120rem] px-4">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[rgb(30,36,44)] sm:text-3xl">
          Account
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Signed in as{" "}
          <span className="font-medium text-[rgb(30,36,44)]">
            {user.email ?? "unknown"}
          </span>
        </p>

        <section className="mt-10 rounded border border-zinc-200 bg-white/80 p-6">
          <h2 className="font-display text-lg font-semibold text-[rgb(30,36,44)]">
            Your listings
          </h2>
          <p className="mt-3 text-sm text-zinc-600">
            Listing management isn&apos;t wired up yet. In the future, this will
            show auctions you&apos;ve created or are selling.
          </p>
        </section>
      </div>
    </main>
  );
}

