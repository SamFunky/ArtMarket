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
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-paper-deep">
            <span className="text-sm text-ink-mute">{item.artType}</span>
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
    <div className="flex aspect-[4/3] w-full items-center justify-center bg-paper-deep">
      <span className="text-sm text-ink-mute">{item.artType}</span>
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
      <main className="min-h-screen bg-paper pt-32 pb-20">
        <div className="mx-auto w-full max-w-[110rem] px-5 sm:px-10 lg:px-14">
          <div className="border border-dashed border-line py-24 text-center">
            <p className="label-caps text-ink-mute">Retrieving the lot…</p>
          </div>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-paper pt-32 pb-20">
        <div className="mx-auto flex w-full max-w-[110rem] flex-col items-center px-5 text-center sm:px-10 lg:px-14">
          <p className="label-caps text-bronze">Withdrawn from sale</p>
          <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            Lot not found
          </h1>
          <p className="mt-4 text-sm text-ink-mute">
            This listing may have ended or been removed.
          </p>
          <Link
            href="/explore"
            className="label-caps mt-8 bg-ink px-8 py-4 text-paper transition-colors hover:bg-bronze"
          >
            Back to the catalogue
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
    <main className="min-h-screen bg-paper pt-32 pb-20">
      <div className="mx-auto w-full max-w-[110rem] px-5 sm:px-10 lg:px-14">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/explore" className="link-underline label-caps text-ink-mute hover:text-ink">
            Catalogue
          </Link>
          <span className="text-ink-mute" aria-hidden>/</span>
          <span className="label-caps text-bronze">
            Lot {/^\d+$/.test(item.id) ? item.id.padStart(3, "0") : item.id.slice(0, 4).toUpperCase()}
          </span>
        </div>
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div className="min-w-0 flex-1">
            <div className="frame-mat relative w-full overflow-hidden">
              <ItemMedia item={item} />
              <div className="absolute right-4 top-4 z-10 rounded-full bg-black/30 p-1">
                <LikeButton itemId={item.id} />
              </div>
            </div>
          </div>

          <aside className="flex shrink-0 flex-col gap-6 lg:w-[30rem] 2xl:w-[36rem]">
            <div className="sticky top-28 border border-line bg-cream p-7 sm:p-9">
              <p className="label-caps text-bronze">
                {item.artType} · {item.era}
              </p>
              <h1 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
                {item.title}
              </h1>

              <dl className="mt-6 border-t border-line pt-5">
                <div className="flex justify-between gap-4 text-sm">
                  <dt className="label-caps text-ink-mute">Dated</dt>
                  <dd className="text-ink">{item.dateRange ?? "—"}</dd>
                </div>
              </dl>

              <p className="mt-5 text-sm leading-relaxed text-ink-mute">
                {item.description ?? "No description provided."}
              </p>

              <div className="mt-8 flex items-end justify-between gap-4 border-t border-line pt-6">
                <div>
                  <p className="label-caps text-ink-mute">Current bid</p>
                  <p className="mt-1 font-display text-4xl tabular-nums text-ink">
                    {formatBid(item.currentBid)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="label-caps text-ink-mute">Closes in</p>
                  <p className="mt-1 text-base font-medium tabular-nums text-ink">
                    <TimeLeft item={item} />
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!canBid}
                onClick={() => canBid && setShowBidModal(true)}
                className={`label-caps mt-8 w-full px-6 py-5 transition-colors duration-300 ${
                  canBid
                    ? "cursor-pointer bg-ink text-paper hover:bg-bronze"
                    : "cursor-not-allowed bg-paper-deep text-ink-mute"
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
                  className="label-caps mt-3 w-full cursor-pointer border border-oxblood/40 bg-transparent px-6 py-3.5 text-oxblood transition-colors hover:bg-oxblood hover:text-paper disabled:opacity-70"
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
          className="w-full max-w-md border border-line bg-cream p-8 shadow-[0_24px_60px_-20px_rgba(29,26,21,0.5)]"
          role="dialog"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="delete-confirm-title" className="font-display text-2xl font-medium text-ink">
            Withdraw this lot?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-mute">
            Are you sure you want to delete this listing? This cannot be undone.
          </p>
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="label-caps flex-1 cursor-pointer bg-oxblood px-4 py-3.5 text-paper transition-colors hover:bg-ink disabled:opacity-70"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
            <button
              type="button"
              onClick={closeDeleteConfirm}
              disabled={deleting}
              className="label-caps flex-1 cursor-pointer border border-ink/25 bg-transparent px-4 py-3.5 text-ink transition-colors hover:bg-paper-deep disabled:opacity-70"
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
