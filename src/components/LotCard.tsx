"use client";

import Link from "next/link";
import { useState } from "react";
import { ListingImage } from "@/components/ListingImage";
import LikeButton from "@/components/LikeButton";
import TimeLeft from "@/components/TimeLeft";
import type { Item } from "@/data/items";

function formatBid(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type LotCardProps = {
  item: Item;
  onImageError?: () => void;
};

export default function LotCard({ item, onImageError }: LotCardProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) return null;

  const closingSoon = item.timeLeftMinutes <= 60 && item.auctionEnded !== true;

  return (
    <Link
      href={`/item/${item.id}`}
      className="group flex flex-col bg-cream ring-1 ring-line transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(29,26,21,0.35)] hover:ring-ink/25"
    >
      <div className="relative m-2.5 mb-0 aspect-[4/3] overflow-hidden bg-paper-deep">
        <ListingImage
          item={item}
          fill
          className="img-zoom h-full w-full object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
          onError={() => {
            setImageError(true);
            onImageError?.();
          }}
        />
        <span className="label-caps absolute left-3 top-3 z-10 bg-ink/80 px-2.5 py-1 text-[10px] text-paper backdrop-blur-sm">
          {item.artType}
        </span>
        <span className="absolute right-2 top-2 z-10">
          <LikeButton itemId={item.id} />
        </span>
        {closingSoon && (
          <span className="label-caps absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-oxblood px-2.5 py-1 text-[10px] text-paper">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-paper" aria-hidden />
            Closing
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <h3 className="truncate font-display text-lg leading-snug text-ink transition-colors group-hover:text-bronze">
          {item.title}
        </h3>
        <div className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3">
          <div className="min-w-0">
            <p className="label-caps text-[10px] text-ink-mute">Current bid</p>
            <p className="mt-0.5 truncate font-display text-lg tabular-nums text-ink">
              {formatBid(item.currentBid)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="label-caps text-[10px] text-ink-mute">Closes in</p>
            <p className={`mt-0.5 text-xs font-medium tabular-nums ${closingSoon ? "text-oxblood" : "text-ink"}`}>
              <TimeLeft item={item} />
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
