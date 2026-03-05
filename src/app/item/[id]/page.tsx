"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useListings } from "@/hooks/useListings";
import { deleteListing, fetchListingById } from "@/lib/listings";
import TimeLeft from "@/components/TimeLeft";
import LikeButton from "@/components/LikeButton";
import ModelViewer from "@/components/ModelViewer";
import ItemComments from "@/components/ItemComments";
import PlaceBidModal from "@/components/PlaceBidModal";
import type { Item } from "@/data/items";
import { getListingImageSrc } from "@/lib/listing-image";

function formatBid(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ItemMedia({ item }: { item: Item }) {
  const [externalImageError, setExternalImageError] = useState(false);

  if (item.model && item.modelSrc) {
    return (
      <ModelViewer
        src={item.modelSrc}
        scale={item.modelScale ?? 1}
        baseRotation={item.modelRotation}
        modelPosition={item.modelPosition}
      />
    );
  }
  if (item.image) {
    const isExternal = item.image.startsWith("http");
    const className = `w-full h-auto ${item.imageFit === "contain" ? "object-contain" : "object-cover"}`;
    const style = item.imagePosition ? { objectPosition: item.imagePosition } : undefined;
    if (isExternal) {
      if (externalImageError) {
        return (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-zinc-200/80">
            <span className="text-sm text-zinc-500">{item.artType}</span>
          </div>
        );
      }
      return (
        <div className="relative w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getListingImageSrc(item.image)}
            alt={item.title}
            className={className}
            style={style}
            sizes="(max-width: 1024px) 100vw, 50vw"
            referrerPolicy="no-referrer"
            onError={() => setExternalImageError(true)}
          />
        </div>
      );
    }
    return (
      <div className="relative w-full">
        <Image
          src={item.image}
          alt={item.title}
          width={1200}
          height={900}
          className={className}
          style={style}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    );
  }
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center bg-zinc-200/80">
      <span className="text-sm text-zinc-500">{item.artType}</span>
    </div>
  );
}

export default function ItemPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : null;
  const { user } = useAuth();
  const { items, loading } = useListings();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [optimisticBid, setOptimisticBid] = useState<number | null>(null);

  const itemFromList = id ? items.find((i) => i.id === id) : null;
  const [itemFromFetch, setItemFromFetch] = useState<Item | null>(null);
  const item = itemFromList ?? itemFromFetch;

  useEffect(() => {
    setItemFromFetch(null);
  }, [id]);

  useEffect(() => {
    if (!id || itemFromList || loading) return;
    fetchListingById(id).then((fetched) => setItemFromFetch(fetched ?? null));
  }, [id, itemFromList, loading]);

  const isOwner = Boolean(
    user && item?.creatorId && item.creatorId === user.uid
  );
  const [showBidModal, setShowBidModal] = useState(false);
  const { refetch } = useListings();

  const auctionEnded = item?.auctionEnded === true;
  const isHighestBidder = Boolean(user && item?.highestBidderId === user.uid);
  const canBid = Boolean(!isOwner && user && !auctionEnded && !isHighestBidder);

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetch("/api/listings/finalize-expired", { method: "POST" }).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (!id || !item) return;
    const ended = (item.timeLeftMinutes ?? 0) <= 0;
    if (ended && !item.auctionEnded) {
      fetch(`/api/listings/${id}/finalize`, { method: "POST" })
        .then((r) => { if (r.ok) refetch(); })
        .catch(() => {});
    }
  }, [id, item?.timeLeftMinutes, item?.auctionEnded, refetch]);

  function openDeleteConfirm() {
    if (!item || !isOwner) return;
    setShowDeleteConfirm(true);
  }

  function closeDeleteConfirm() {
    if (!deleting) setShowDeleteConfirm(false);
  }

  async function confirmDelete() {
    if (!item || !isOwner) return;
    setDeleting(true);
    try {
      await deleteListing(item.id);
      router.push("/account");
    } catch {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf5f2] pt-32 pb-20">
        <div className="mx-auto w-full max-w-[120rem] px-4">
          <div className="rounded-lg bg-white/50 py-20 text-center">
            <p className="text-sm text-zinc-500">Loading…</p>
          </div>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-[#faf5f2] pt-32 pb-20">
        <div className="mx-auto flex w-full max-w-[120rem] flex-col items-center px-4 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[rgb(30,36,44)] sm:text-3xl">
            Item not found
          </h1>
          <p className="mt-4 text-sm text-zinc-600">
            This listing may have ended or been removed.
          </p>
          <Link
            href="/explore"
            className="mt-6 bg-[rgb(30,36,44)] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[rgb(40,48,58)]"
          >
            Explore
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
    <main className="min-h-screen bg-[#faf5f2] pt-32 pb-20">
      <div className="mx-auto w-full max-w-[120rem] px-4">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div className="min-w-0 flex-1">
            <div className="relative w-full overflow-hidden rounded border border-zinc-200/80 bg-white/80">
              <ItemMedia item={item} />
              <div className="absolute right-3 top-3 z-10 rounded-full bg-black/30 p-1">
                <LikeButton itemId={item.id} />
              </div>
            </div>
          </div>

          <aside className="flex shrink-0 flex-col gap-6 lg:w-[32rem]">
            <div className="sticky top-24 rounded border border-zinc-200 bg-white/80 p-6">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-[rgb(30,36,44)]">
                {item.title}
              </h1>
              <p className="mt-1 text-sm uppercase tracking-wider text-zinc-500">
                {item.artType} · {item.era}
              </p>

              <p className="mt-4 text-sm text-zinc-600">
                <span className="font-medium text-[rgb(30,36,44)]">Date:</span>{" "}
                {item.dateRange ?? "—"}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                {item.description ?? "No description provided."}
              </p>

              <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-zinc-200 pt-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Current bid
                  </p>
                  <p className="text-2xl font-bold text-[rgb(30,36,44)]">
                    {formatBid(item.currentBid)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Time left
                  </p>
                  <p className="text-lg font-medium text-[rgb(30,36,44)]">
                    <TimeLeft item={item} />
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!canBid}
                onClick={() => canBid && setShowBidModal(true)}
                className={`mt-6 w-full px-6 py-4 text-base font-medium transition-colors ${
                  canBid
                    ? "bg-[rgb(30,36,44)] text-white hover:bg-[rgb(40,48,58)]"
                    : "cursor-not-allowed bg-zinc-300 text-zinc-500"
                }`}
              >
                {auctionEnded
                  ? "Auction ended"
                  : isHighestBidder
                    ? "Your bid is already highest"
                    : "Place Bid"}
              </button>

              {showBidModal && user && item && (
                <PlaceBidModal
                  item={item}
                  bidderId={user.uid}
                  bidderEmail={user.email ?? ""}
                  onClose={() => setShowBidModal(false)}
                  onSuccess={() => {
                    window.location.reload();
                  }}
                />
              )}

              {isOwner && (
                <button
                  type="button"
                  onClick={openDeleteConfirm}
                  disabled={deleting}
                  className="mt-3 w-full border border-red-300 bg-white px-6 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-70"
                >
                  {deleting ? "Deleting…" : "Delete listing"}
                </button>
              )}
            </div>

            <ItemComments listingId={item.id} creatorId={item.creatorId} />
          </aside>
        </div>
      </div>
    </main>

    {showDeleteConfirm && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        onClick={closeDeleteConfirm}
      >
        <div
          className="w-full max-w-md rounded border border-zinc-200 bg-white p-6 shadow-lg"
          role="dialog"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="delete-confirm-title" className="font-display text-lg font-semibold text-[rgb(30,36,44)]">
            Delete listing?
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Are you sure you want to delete this listing? This cannot be undone.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="flex-1 rounded bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-70"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
            <button
              type="button"
              onClick={closeDeleteConfirm}
              disabled={deleting}
              className="flex-1 rounded border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-70"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
