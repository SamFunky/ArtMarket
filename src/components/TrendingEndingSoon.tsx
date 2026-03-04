"use client";

import Link from "next/link";
import LikeButton from "@/components/LikeButton";
import { allItems } from "@/data/items";

function formatBid(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTimeLeft(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function TrendingEndingSoon() {
  const endingSoon = [...allItems]
    .sort((a, b) => a.timeLeftMinutes - b.timeLeftMinutes)
    .slice(0, 8);

  return (
    <section className="w-full bg-[#f5e6dc] px-6 py-20">
      <div className="mx-auto max-w-[120rem]">
        <div className="relative mb-10 flex items-center justify-center">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight text-[rgb(30,36,44)] sm:text-3xl">
            Ending soon
          </h2>
          <Link
            href="/explore"
            className="absolute right-0 text-sm font-medium text-zinc-600 underline decoration-zinc-400 underline-offset-2 transition-colors hover:text-[rgb(30,36,44)]"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {endingSoon.map((item) => (
            <Link
              key={item.id}
              href={`/item/${item.id}`}
              className="group flex flex-col overflow-hidden rounded-lg bg-white/70 backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-200/80">
                <span className="absolute left-2.5 top-2.5 rounded bg-black/50 px-2 py-0.5 text-[11px] font-medium tracking-wide text-white/95 uppercase">
                  {item.artType}
                </span>
                <span className="absolute right-2.5 top-2.5">
                  <LikeButton itemId={item.id} />
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                <h3 className="font-display text-[15px] font-medium text-[rgb(30,36,44)] line-clamp-2 leading-snug group-hover:text-zinc-600">
                  {item.title}
                </h3>
                <div className="mt-auto flex items-baseline justify-between gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                      Bid
                    </p>
                    <p className="text-base font-semibold text-[rgb(30,36,44)]">
                      {formatBid(item.currentBid)}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {formatTimeLeft(item.timeLeftMinutes)} left
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
