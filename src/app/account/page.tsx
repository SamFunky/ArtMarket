"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLiked } from "@/context/LikedContext";
import { useListings } from "@/hooks/useListings";
import { useAccountData } from "@/context/AccountDataContext";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import LikeButton from "@/components/LikeButton";
import MessageThread from "@/components/MessageThread";
import TimeLeft from "@/components/TimeLeft";
import type { Item } from "@/data/items";

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
    listingCreatorId?: string;
    amount: number;
    status: string;
  };
  onPaymentComplete: () => void;
};

function PurchaseRow({ purchase }: PurchaseRowProps) {
  const { user } = useAuth();
  const [paying, setPaying] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const isPending = purchase.status === "pending";
  const canMessage = Boolean(
    user &&
    purchase.listingCreatorId &&
    purchase.listingCreatorId !== user.uid
  );
  const { unreadCount } = useUnreadMessages(
    canMessage ? purchase.id : null,
    user?.uid ?? "",
    purchase.listingCreatorId ?? "",
    chatExpanded
  );

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
    <div className="overflow-hidden rounded border border-line bg-cream">
      <Link href={`/item/${purchase.listingId}`} className="block sm:hidden">
        {purchase.listingImage ? (
          <div className="relative h-40 w-full overflow-hidden bg-paper-deep">
            <Image
              src={purchase.listingImage}
              alt={purchase.listingTitle ?? "Listing"}
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized={purchase.listingImage.startsWith("http")}
            />
          </div>
        ) : (
          <div className="flex h-32 w-full items-center justify-center bg-paper-deep text-xs text-ink-mute/70">—</div>
        )}
      </Link>

      <div className="flex items-start gap-4 p-4">
        {purchase.listingImage ? (
          <Link href={`/item/${purchase.listingId}`} className="relative hidden h-16 w-20 shrink-0 overflow-hidden rounded bg-paper-deep sm:block">
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
          <div className="hidden h-16 w-20 shrink-0 items-center justify-center rounded bg-paper-deep text-xs text-ink-mute/70 sm:flex">—</div>
        )}

        <div className="min-w-0 flex-1">
          <Link
            href={`/item/${purchase.listingId}`}
            className="line-clamp-2 font-medium text-ink hover:underline sm:line-clamp-none"
          >
            {purchase.listingTitle ?? "Untitled"}
          </Link>
          <p className="mt-1 text-sm text-ink-mute">
            {formatBid(purchase.amount)}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {isPending && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                Pending payment
              </span>
            )}
            {purchase.status === "paid" && (
              <span className="rounded bg-bronze/15 px-1.5 py-0.5 text-xs text-bronze">
                Paid
              </span>
            )}
          </div>
        </div>

        {canMessage && (
          <button
            type="button"
            onClick={() => setChatExpanded((e) => !e)}
            className={`relative hidden shrink-0 rounded p-2 transition-colors sm:block ${
              chatExpanded
                ? "bg-paper-deep text-ink"
                : "text-ink-mute hover:bg-paper-deep hover:text-ink-soft"
            }`}
            aria-label={chatExpanded ? "Close chat" : "Message seller"}
            title={chatExpanded ? "Close chat" : "Message seller"}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-oxblood" aria-hidden="true" />
            )}
          </button>
        )}
        {isPending && (
          <button
            type="button"
            onClick={handlePayNow}
            disabled={paying}
            className="hidden shrink-0 bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-70 sm:block"
          >
            {paying ? "Redirecting…" : "Pay now"}
          </button>
        )}
      </div>

      {(isPending || canMessage) && (
        <div className="flex gap-2 border-t border-line px-4 pb-4 pt-3 sm:hidden">
          {isPending && (
            <button
              type="button"
              onClick={handlePayNow}
              disabled={paying}
              className="flex-1 bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-70"
            >
              {paying ? "Redirecting…" : "Pay now"}
            </button>
          )}
          {canMessage && (
            <button
              type="button"
              onClick={() => setChatExpanded((e) => !e)}
              className={`relative flex items-center gap-2 rounded border px-4 py-2.5 text-sm font-medium transition-colors ${
                chatExpanded
                  ? "border-ink/25 bg-paper-deep text-ink"
                  : "border-line bg-cream text-ink-mute hover:bg-paper-deep"
              }`}
              aria-label={chatExpanded ? "Close chat" : "Message seller"}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Message
              {unreadCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-oxblood" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      )}

      {chatExpanded && canMessage && user && purchase.listingCreatorId && (
        <div className="border-t border-line bg-paper-deep/50 p-4">
          <MessageThread
            purchaseId={purchase.id}
            currentUserId={user.uid}
            otherUserId={purchase.listingCreatorId}
            currentUserEmail={user.email ?? ""}
          />
        </div>
      )}
    </div>
  );
}

type SellerPurchaseRowProps = {
  purchase: {
    id: string;
    listingId: string;
    listingTitle?: string;
    listingImage?: string;
    buyerId: string;
    buyerEmail?: string;
    amount: number;
    status: string;
  };
};

function SellerPurchaseRow({ purchase }: SellerPurchaseRowProps) {
  const { user } = useAuth();
  const [chatExpanded, setChatExpanded] = useState(false);
  const canMessage = Boolean(user && purchase.buyerId && purchase.buyerId !== user.uid);
  const { unreadCount } = useUnreadMessages(
    canMessage ? purchase.id : null,
    user?.uid ?? "",
    purchase.buyerId ?? "",
    chatExpanded
  );

  return (
    <div className="overflow-hidden rounded border border-line bg-cream">
      <Link href={`/item/${purchase.listingId}`} className="block sm:hidden">
        {purchase.listingImage ? (
          <div className="relative h-40 w-full overflow-hidden bg-paper-deep">
            <Image
              src={purchase.listingImage}
              alt={purchase.listingTitle ?? "Listing"}
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized={purchase.listingImage.startsWith("http")}
            />
          </div>
        ) : (
          <div className="flex h-32 w-full items-center justify-center bg-paper-deep text-xs text-ink-mute/70">—</div>
        )}
      </Link>

      <div className="flex items-start gap-4 p-4">
        {purchase.listingImage ? (
          <Link href={`/item/${purchase.listingId}`} className="relative hidden h-16 w-20 shrink-0 overflow-hidden rounded bg-paper-deep sm:block">
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
          <div className="hidden h-16 w-20 shrink-0 items-center justify-center rounded bg-paper-deep text-xs text-ink-mute/70 sm:flex">—</div>
        )}

        <div className="min-w-0 flex-1">
          <Link
            href={`/item/${purchase.listingId}`}
            className="line-clamp-2 font-medium text-ink hover:underline sm:line-clamp-none"
          >
            {purchase.listingTitle ?? "Untitled"}
          </Link>
          <p className="mt-1 text-sm text-ink-mute">
            Sold for {formatBid(purchase.amount)}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
              purchase.status === "paid"
                ? "bg-bronze/15 text-bronze"
                : "bg-amber-100 text-amber-800"
            }`}>
              {purchase.status === "paid" ? "Paid" : "Unpaid"}
            </span>
            <span className="rounded bg-paper-deep px-1.5 py-0.5 text-xs text-ink-mute">
              Ended
            </span>
            <span className="rounded bg-bronze/10 px-1.5 py-0.5 text-[10px] text-bronze">
              {purchase.buyerEmail ?? "—"}
            </span>
          </div>
        </div>

        {canMessage && (
          <button
            type="button"
            onClick={() => setChatExpanded((e) => !e)}
            className={`relative hidden shrink-0 rounded p-2 transition-colors sm:block ${
              chatExpanded
                ? "bg-paper-deep text-ink"
                : "text-ink-mute hover:bg-paper-deep hover:text-ink-soft"
            }`}
            aria-label={chatExpanded ? "Close chat" : "Message buyer"}
            title={chatExpanded ? "Close chat" : "Message buyer"}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-oxblood" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {canMessage && (
        <div className="flex gap-2 border-t border-line px-4 pb-4 pt-3 sm:hidden">
          <button
            type="button"
            onClick={() => setChatExpanded((e) => !e)}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded border px-4 py-2.5 text-sm font-medium transition-colors ${
              chatExpanded
                ? "border-ink/25 bg-paper-deep text-ink"
                : "border-line bg-cream text-ink-mute hover:bg-paper-deep"
            }`}
            aria-label={chatExpanded ? "Close chat" : "Message buyer"}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Message buyer
            {unreadCount > 0 && (
              <span className="h-2 w-2 rounded-full bg-oxblood" aria-hidden="true" />
            )}
          </button>
        </div>
      )}

      {chatExpanded && canMessage && user && (
        <div className="border-t border-line bg-paper-deep/50 p-4">
          <MessageThread
            purchaseId={purchase.id}
            currentUserId={user.uid}
            otherUserId={purchase.buyerId}
            currentUserEmail={user.email ?? ""}
          />
        </div>
      )}
    </div>
  );
}

type ListingCardProps = {
  item: Item;
};

function ListingCard({ item }: ListingCardProps) {
  return (
    <Link
      href={`/item/${item.id}`}
      className="block overflow-hidden rounded border border-line bg-cream transition-colors hover:bg-paper-deep/50"
    >
      <div className="sm:hidden">
        {item.image ? (
          <div className="relative h-40 w-full overflow-hidden bg-paper-deep">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized={item.image.startsWith("http")}
            />
          </div>
        ) : (
          <div className="flex h-32 w-full items-center justify-center bg-paper-deep text-xs text-ink-mute/70">—</div>
        )}
      </div>

      <div className="flex items-start gap-4 p-4">
        {item.image ? (
          <div className="relative hidden h-16 w-20 shrink-0 overflow-hidden rounded bg-paper-deep sm:block">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="80px"
              unoptimized={item.image.startsWith("http")}
            />
          </div>
        ) : (
          <div className="hidden h-16 w-20 shrink-0 items-center justify-center rounded bg-paper-deep text-xs text-ink-mute/70 sm:flex">—</div>
        )}

        <div className="min-w-0 flex-1">
          <span className="line-clamp-2 font-medium text-ink sm:line-clamp-none">{item.title}</span>
          <p className="mt-1 text-sm text-ink-mute">
            Current bid {formatBid(item.currentBid)}
          </p>
          <div className="mt-1.5">
            <span className="rounded bg-paper-deep px-1.5 py-0.5 text-[10px] text-ink-mute">
              No buyer
            </span>
          </div>
        </div>

        <span className="shrink-0 rounded bg-paper-deep px-2 py-1 text-xs text-ink-mute">
          <TimeLeft item={item} />
        </span>
      </div>
    </Link>
  );
}

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("purchases");
  const { likedIds } = useLiked();
  const { items: allItems } = useListings();
  const {
    myListings,
    listingsLoading,
    purchases,
    purchasesLoading,
    sellerPurchases,
    refetchPurchases,
  } = useAccountData();
  const likedItems = allItems.filter((item) => likedIds.has(item.id));

  if (authLoading) {
    return (
      <main className="min-h-screen bg-paper pt-32 pb-20">
        <div className="mx-auto w-full max-w-[110rem] px-5 sm:px-10 lg:px-14">
          <div className="h-8 w-32 animate-pulse rounded bg-paper-deep" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-paper-deep" />
          <div className="mt-10 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-32 animate-pulse rounded-full bg-paper-deep" />
            ))}
          </div>
          <div className="mt-6 h-64 w-full animate-pulse rounded border border-line bg-paper-deep" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-paper pt-32 pb-20">
        <div className="mx-auto flex w-full max-w-[120rem] flex-col items-center px-4 text-center">
          <h1 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            Account
          </h1>
          <p className="mt-4 text-sm text-ink-mute">
            You need to be signed in to view your account.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/signin"
              className="bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="border border-ink/25 px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper-deep"
            >
              Create account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper pt-32 pb-20">
      <div className="mx-auto w-full max-w-[110rem] px-5 sm:px-10 lg:px-14">
        <h1 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
          Account
        </h1>
        <p className="mt-2 text-sm text-ink-mute">
          Signed in as{" "}
          <span className="font-medium text-ink">
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
            className={`label-caps cursor-pointer px-4 py-2.5 transition-all ${
              activeTab === "purchases"
                ? "bg-ink text-paper"
                : "bg-cream text-ink-mute ring-1 ring-line hover:ring-ink/40"
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
            className={`label-caps cursor-pointer px-4 py-2.5 transition-all ${
              activeTab === "liked"
                ? "bg-ink text-paper"
                : "bg-cream text-ink-mute ring-1 ring-line hover:ring-ink/40"
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
            className={`label-caps cursor-pointer px-4 py-2.5 transition-all ${
              activeTab === "listings"
                ? "bg-ink text-paper"
                : "bg-cream text-ink-mute ring-1 ring-line hover:ring-ink/40"
            }`}
          >
            Your listings
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <section className="min-w-0 flex-1 rounded border border-line bg-cream/80 p-6">
            {activeTab === "purchases" && (
              <div
                id="purchases-panel"
                role="tabpanel"
                aria-labelledby="purchases-tab"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <p className="text-sm text-ink-mute">
                    Items you&apos;ve won. Complete payment for pending purchases.
                  </p>
                  <Link
                    href="/explore"
                    className="shrink-0 border border-ink/25 bg-cream px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper-deep"
                  >
                    Explore
                  </Link>
                </div>
                {purchasesLoading ? (
                  <div className="mt-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 rounded border border-line bg-cream p-4">
                        <div className="hidden h-16 w-20 shrink-0 animate-pulse rounded bg-paper-deep sm:block" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-2/3 animate-pulse rounded bg-paper-deep" />
                          <div className="h-3 w-1/4 animate-pulse rounded bg-paper-deep" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : purchases.length === 0 ? (
                  <div className="mt-4 rounded border border-dashed border-ink/25 bg-paper-deep/50 py-8 text-center">
                    <p className="text-sm text-ink-mute">No purchases yet</p>
                    <p className="mt-1 text-xs text-ink-mute/70">
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
                  <p className="text-sm text-ink-mute">
                    Items you&apos;ve liked. Quick access to auctions you&apos;re
                    watching.
                  </p>
                  <Link
                    href="/explore"
                    className="shrink-0 border border-ink/25 bg-cream px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper-deep"
                  >
                    Explore
                  </Link>
                </div>
                {likedItems.length === 0 ? (
                  <div className="mt-4 rounded border border-dashed border-ink/25 bg-paper-deep/50 py-8 text-center">
                    <p className="text-sm text-ink-mute">No liked listings yet</p>
                    <p className="mt-1 text-xs text-ink-mute/70">
                      Like items on the Explore page to see them here
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {likedItems.map((item) => (
                      <Link
                        key={item.id}
                        href={`/item/${item.id}`}
                        className="group relative flex aspect-[4/3] overflow-hidden border border-white/60 bg-paper-deep shadow-sm transition-all hover:-translate-y-1 hover:border-white hover:shadow-md"
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
                          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-paper/90">
                            {item.artType}
                          </span>
                          <span className="absolute right-2.5 top-2.5 z-10">
                            <LikeButton itemId={item.id} />
                          </span>
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-10">
                            <h3 className="truncate text-sm font-semibold text-paper">
                              {item.title}
                            </h3>
                            <div className="mt-2 flex items-end justify-between gap-2 text-xs text-paper/90">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-paper/70">
                                  Current bid
                                </p>
                                <p className="text-base font-semibold">
                                  {formatBid(item.currentBid)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wider text-paper/70">
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
                  <p className="text-sm text-ink-mute">
                    Auctions you&apos;ve created or are selling. Create a new
                    listing to start selling.
                  </p>
                  <Link
                    href="/create-listing"
                    className="shrink-0 border border-ink/25 bg-cream px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper-deep"
                    aria-label="Create new listing"
                  >
                    Create listing
                  </Link>
                </div>
                {listingsLoading ? (
                  <div className="mt-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 rounded border border-line bg-cream p-4">
                        <div className="hidden h-16 w-20 shrink-0 animate-pulse rounded bg-paper-deep sm:block" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-2/3 animate-pulse rounded bg-paper-deep" />
                          <div className="h-3 w-1/4 animate-pulse rounded bg-paper-deep" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : myListings.length === 0 ? (
                  <div className="mt-4 rounded border border-dashed border-ink/25 bg-paper-deep/50 py-8 text-center">
                    <p className="text-sm text-ink-mute">No listings yet</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {myListings
                      .filter((item) => !sellerPurchases.some((p) => p.listingId === item.id))
                      .map((item) => (
                        <ListingCard key={item.id} item={item} />
                      ))}
                    {sellerPurchases
                      .filter((p) => p.status !== "paid")
                      .map((p) => (
                        <SellerPurchaseRow key={p.id} purchase={p} />
                      ))}
                    {sellerPurchases
                      .filter((p) => p.status === "paid")
                      .map((p) => (
                        <SellerPurchaseRow key={p.id} purchase={p} />
                      ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

