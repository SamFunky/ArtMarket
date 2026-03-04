"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Tab = "purchases" | "listings";

export default function AccountPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("purchases");

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

        <div
          role="tablist"
          aria-label="Account sections"
          className="mt-10 flex flex-wrap gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "purchases"}
            aria-controls="purchases-panel"
            id="purchases-tab"
            onClick={() => setActiveTab("purchases")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "purchases"
                ? "bg-[rgb(30,36,44)] text-white"
                : "bg-white/80 text-zinc-600 ring-1 ring-zinc-200/80 hover:ring-zinc-300"
            }`}
          >
            Previous purchases
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "listings"}
            aria-controls="listings-panel"
            id="listings-tab"
            onClick={() => setActiveTab("listings")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "listings"
                ? "bg-[rgb(30,36,44)] text-white"
                : "bg-white/80 text-zinc-600 ring-1 ring-zinc-200/80 hover:ring-zinc-300"
            }`}
          >
            Your listings
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <section className="min-w-0 flex-1 rounded border border-zinc-200 bg-white/80 p-6">
            {activeTab === "purchases" && (
              <div
                id="purchases-panel"
                role="tabpanel"
                aria-labelledby="purchases-tab"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <p className="text-sm text-zinc-600">
                    A history of items you&apos;ve won. Purchase records and
                    delivery status will appear here once you&apos;ve won your
                    first auction.
                  </p>
                  <Link
                    href="/explore"
                    className="shrink-0 border border-zinc-400 bg-white px-5 py-2.5 text-sm font-medium text-[rgb(30,36,44)] transition-colors hover:bg-zinc-50"
                  >
                    Explore
                  </Link>
                </div>
                <div className="mt-4 rounded border border-dashed border-zinc-300 bg-zinc-50/50 py-8 text-center">
                  <p className="text-sm text-zinc-500">No purchases yet</p>
                </div>
              </div>
            )}

            {activeTab === "listings" && (
              <div
                id="listings-panel"
                role="tabpanel"
                aria-labelledby="listings-tab"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <p className="text-sm text-zinc-600">
                    Auctions you&apos;ve created or are selling. Create a new
                    listing to start selling.
                  </p>
                  <button
                    type="button"
                    className="shrink-0 border border-zinc-400 bg-white px-5 py-2.5 text-sm font-medium text-[rgb(30,36,44)] transition-colors hover:bg-zinc-50"
                    aria-label="Create new listing"
                  >
                    Create listing
                  </button>
                </div>
                <div className="mt-4 rounded border border-dashed border-zinc-300 bg-zinc-50/50 py-8 text-center">
                  <p className="text-sm text-zinc-500">No listings yet</p>
                </div>
              </div>
            )}
          </section>

          <aside className="shrink-0 lg:w-80">
            <section className="rounded border border-zinc-200 bg-white/80 p-5">
              <h2 className="font-display text-base font-semibold text-[rgb(30,36,44)]">
                Messages
              </h2>
              <p className="mt-2 text-xs text-zinc-600">
                Chat with sellers you&apos;ve bought from about delivery or
                questions.
              </p>
              <div className="mt-4 rounded border border-dashed border-zinc-300 bg-zinc-50/50 py-6 text-center">
                <p className="text-sm text-zinc-500">No conversations yet</p>
                <p className="mt-1 text-xs text-zinc-400">
                  Start a chat from a completed purchase
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

