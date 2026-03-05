"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLiked } from "@/context/LikedContext";
import { useListings } from "@/hooks/useListings";
import { useMyListings } from "@/hooks/useMyListings";
import { usePurchases } from "@/hooks/usePurchases";
import LikeButton from "@/components/LikeButton";
import TimeLeft from "@/components/TimeLeft";

type Tab = "purchases" | "liked" | "listings";

function formatBid(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type PurchaseRowProps = {
  purchase: {
    id: string;
    listingId: string;
    listingTitle?: string;
    listingImage?: string;
    amount: number;
    status: string;
  };
  onPaymentComplete: () => void;
};

function PurchaseRow({ purchase }: PurchaseRowProps) {
  const [paying, setPaying] = useState(false);
  const isPending = purchase.status === "pending";

  async function handlePayNow() {
    setPaying(true);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId: purchase.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPaying(false);
      }
    } catch {
      setPaying(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded border border-zinc-200 bg-white p-4">
      {purchase.listingImage ? (
        <Link href={`/item/${purchase.listingId}`} className="relative h-16 w-20 shrink-0 overflow-hidden rounded bg-zinc-100">
          <Image
            src={purchase.listingImage}
            alt={purchase.listingTitle ?? "Listing"}
            fill
            className="object-cover"
            sizes="80px"
            unoptimized={purchase.listingImage.startsWith("http")}
          />
        </Link>
      ) : (
        <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded bg-zinc-100 text-xs text-zinc-400">
          —
        </div>
      )}
      <div className="min-w-0 flex-1">
        <Link
          href={`/item/${purchase.listingId}`}
          className="font-medium text-[rgb(30,36,44)] hover:underline"
        >
          {purchase.listingTitle ?? "Untitled"}
        </Link>
        <p className="text-sm text-zinc-600">
          {formatBid(purchase.amount)}
          {isPending && (
            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
              Pending payment
            </span>
          )}
          {purchase.status === "paid" && (
            <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800">
              Paid
            </span>
          )}
        </p>
      </div>
      {isPending && (
        <button
          type="button"
          onClick={handlePayNow}
          disabled={paying}
          className="shrink-0 bg-[rgb(30,36,44)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[rgb(40,48,58)] disabled:opacity-70"
        >
          {paying ? "Redirecting…" : "Pay now"}
        </button>
      )}
    </div>
  );
}

export default function AccountPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("purchases");
  const { likedIds } = useLiked();
  const { items: allItems } = useListings();
  const { items: myListings, loading: listingsLoading } = useMyListings(user?.uid ?? null);
  const { purchases, loading: purchasesLoading, refetch: refetchPurchases } = usePurchases(user?.uid ?? null);
  const likedItems = allItems.filter((item) => likedIds.has(item.id));

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
            aria-selected={activeTab === "liked"}
            aria-controls="liked-panel"
            id="liked-tab"
            onClick={() => setActiveTab("liked")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "liked"
                ? "bg-[rgb(30,36,44)] text-white"
                : "bg-white/80 text-zinc-600 ring-1 ring-zinc-200/80 hover:ring-zinc-300"
            }`}
          >
            Liked listings
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
                    Items you&apos;ve won. Complete payment for pending purchases.
                  </p>
                  <Link
                    href="/explore"
                    className="shrink-0 border border-zinc-400 bg-white px-5 py-2.5 text-sm font-medium text-[rgb(30,36,44)] transition-colors hover:bg-zinc-50"
                  >
                    Explore
                  </Link>
                </div>
                {purchasesLoading ? (
                  <div className="mt-4 rounded border border-zinc-200 bg-zinc-50/50 py-8 text-center">
                    <p className="text-sm text-zinc-500">Loading…</p>
                  </div>
                ) : purchases.length === 0 ? (
                  <div className="mt-4 rounded border border-dashed border-zinc-300 bg-zinc-50/50 py-8 text-center">
                    <p className="text-sm text-zinc-500">No purchases yet</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Win an auction to see it here
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {purchases.map((p) => (
                      <PurchaseRow key={p.id} purchase={p} onPaymentComplete={refetchPurchases} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "liked" && (
              <div
                id="liked-panel"
                role="tabpanel"
                aria-labelledby="liked-tab"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <p className="text-sm text-zinc-600">
                    Items you&apos;ve liked. Quick access to auctions you&apos;re
                    watching.
                  </p>
                  <Link
                    href="/explore"
                    className="shrink-0 border border-zinc-400 bg-white px-5 py-2.5 text-sm font-medium text-[rgb(30,36,44)] transition-colors hover:bg-zinc-50"
                  >
                    Explore
                  </Link>
                </div>
                {likedItems.length === 0 ? (
                  <div className="mt-4 rounded border border-dashed border-zinc-300 bg-zinc-50/50 py-8 text-center">
                    <p className="text-sm text-zinc-500">No liked listings yet</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Like items on the Explore page to see them here
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {likedItems.map((item) => (
                      <Link
                        key={item.id}
                        href={`/item/${item.id}`}
                        className="group relative flex aspect-[4/3] overflow-hidden border border-white/60 bg-zinc-200/80 shadow-sm transition-all hover:-translate-y-1 hover:border-white hover:shadow-md"
                      >
                        <div className="relative h-full w-full overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              unoptimized={item.image.startsWith("http")}
                            />
                          ) : null}
                          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/90">
                            {item.artType}
                          </span>
                          <span className="absolute right-2.5 top-2.5 z-10">
                            <LikeButton itemId={item.id} />
                          </span>
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-10">
                            <h3 className="truncate text-sm font-semibold text-white">
                              {item.title}
                            </h3>
                            <div className="mt-2 flex items-end justify-between gap-2 text-xs text-white/90">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-white/70">
                                  Current bid
                                </p>
                                <p className="text-base font-semibold">
                                  {formatBid(item.currentBid)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wider text-white/70">
                                  Time left
                                </p>
                                <p className="font-medium">
                                  <TimeLeft item={item} />
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
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
                  <Link
                    href="/create-listing"
                    className="shrink-0 border border-zinc-400 bg-white px-5 py-2.5 text-sm font-medium text-[rgb(30,36,44)] transition-colors hover:bg-zinc-50"
                    aria-label="Create new listing"
                  >
                    Create listing
                  </Link>
                </div>
                {listingsLoading ? (
                  <div className="mt-4 rounded border border-zinc-200 bg-zinc-50/50 py-8 text-center">
                    <p className="text-sm text-zinc-500">Loading…</p>
                  </div>
                ) : myListings.length === 0 ? (
                  <div className="mt-4 rounded border border-dashed border-zinc-300 bg-zinc-50/50 py-8 text-center">
                    <p className="text-sm text-zinc-500">No listings yet</p>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {myListings.map((item) => (
                      <Link
                        key={item.id}
                        href={`/item/${item.id}`}
                        className="group relative flex aspect-[4/3] overflow-hidden border border-white/60 bg-zinc-200/80 shadow-sm transition-all hover:-translate-y-1 hover:border-white hover:shadow-md"
                      >
                        <div className="relative h-full w-full overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              unoptimized={item.image.startsWith("http")}
                            />
                          ) : null}
                          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/90">
                            {item.artType}
                          </span>
                          <span className="absolute right-2.5 top-2.5 z-10">
                            <LikeButton itemId={item.id} />
                          </span>
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-10">
                            <h3 className="truncate text-sm font-semibold text-white">
                              {item.title}
                            </h3>
                            <div className="mt-2 flex items-end justify-between gap-2 text-xs text-white/90">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-white/70">
                                  Current bid
                                </p>
                                <p className="text-base font-semibold">
                                  {formatBid(item.currentBid)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wider text-white/70">
                                  Time left
                                </p>
                                <p className="font-medium">
                                  <TimeLeft item={item} />
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
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

