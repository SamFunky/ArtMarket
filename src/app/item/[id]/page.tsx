"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useListings } from "@/hooks/useListings";
import TimeLeft from "@/components/TimeLeft";
import LikeButton from "@/components/LikeButton";
import ModelViewer from "@/components/ModelViewer";
import ItemComments from "@/components/ItemComments";
import type { Item } from "@/data/items";

function formatBid(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ItemMedia({ item }: { item: Item }) {
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
    return (
      <div className="relative w-full">
        <Image
          src={item.image}
          alt={item.title}
          width={1200}
          height={900}
          className={`w-full h-auto ${item.imageFit === "contain" ? "object-contain" : "object-cover"}`}
          style={
            item.imagePosition
              ? { objectPosition: item.imagePosition }
              : undefined
          }
          sizes="(max-width: 1024px) 100vw, 50vw"
          unoptimized={item.image.startsWith("http")}
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
  const id = typeof params?.id === "string" ? params.id : null;
  const { items, loading } = useListings();

  const item = id ? items.find((i) => i.id === id) : null;

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
                className="mt-6 w-full bg-[rgb(30,36,44)] px-6 py-4 text-base font-medium text-white transition-colors hover:bg-[rgb(40,48,58)]"
              >
                Place Bid
              </button>
            </div>

            <ItemComments listingId={item.id} />
          </aside>
        </div>
      </div>
    </main>
  );
}
