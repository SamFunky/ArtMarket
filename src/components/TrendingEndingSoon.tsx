"use client";

import Link from "next/link";
import { ListingImage } from "@/components/ListingImage";
import LikeButton from "@/components/LikeButton";
import TimeLeft from "@/components/TimeLeft";
import { useListings } from "@/hooks/useListings";

function formatBid(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function TrendingEndingSoon() {
  const { items } = useListings();
  const endingSoon = [...items]
    .sort((a, b) => a.timeLeftMinutes - b.timeLeftMinutes)
    .slice(0, 12);

  return (
    <section className="w-full bg-[#faf5f2] px-6 py-20">
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {endingSoon.map((item) => (
            <Link
              key={item.id}
              href={`/item/${item.id}`}
              className="group relative flex aspect-[4/3] overflow-hidden border border-white/60 bg-zinc-200/80 shadow-sm transition-all hover:-translate-y-1 hover:border-white hover:shadow-md"
            >
              <div className="relative h-full w-full overflow-hidden">
                {item.image ? (
                  <ListingImage
                    item={item}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
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
      </div>
    </section>
  );
}
