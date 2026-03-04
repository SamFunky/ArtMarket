"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FilterSelect from "@/components/FilterSelect";
import LikeButton from "@/components/LikeButton";
import PriceRangeFilter from "@/components/PriceRangeFilter";
import TimeLeft from "@/components/TimeLeft";
import { useLiked } from "@/context/LikedContext";
import { type Item, type ArtEra, type ArtType } from "@/data/items";
import { useListings } from "@/hooks/useListings";

type SortOption =
  | "price-asc"
  | "price-desc"
  | "ending-soon"
  | "most-time"
  | "name-asc"
  | "name-desc";

const SORT_LABELS: Record<SortOption, string> = {
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "ending-soon": "Ending Soon",
  "most-time": "Most Time Left",
  "name-asc": "Name: A–Z",
  "name-desc": "Name: Z–A",
};

const ART_ERAS: { value: ArtEra | "all"; label: string }[] = [
  { value: "all", label: "All eras" },
  { value: "ancient", label: "Ancient" },
  { value: "classical", label: "Classical" },
  { value: "renaissance", label: "Renaissance" },
  { value: "baroque", label: "Baroque" },
  { value: "modern", label: "Modern" },
  { value: "contemporary", label: "Contemporary" },
];

const ART_TYPES: { value: ArtType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "oil painting", label: "Oil Painting" },
  { value: "watercolor", label: "Watercolor" },
  { value: "drawing", label: "Drawing" },
  { value: "sculpture", label: "Sculpture" },
  { value: "ceramic", label: "Ceramic" },
  { value: "mixed media", label: "Mixed Media" },
];

function formatBid(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ExplorePage() {
  const { items, loading } = useListings();
  const { likedIds } = useLiked();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("price-asc");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [era, setEra] = useState<ArtEra | "all">("all");
  const [artType, setArtType] = useState<ArtType | "all">("all");
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const cycleTimeSort = () => {
    setSort((prev) => {
      if (prev === "ending-soon") return "most-time";
      if (prev === "most-time") return "price-asc";
      return "ending-soon";
    });
  };

  const timeSortActive = sort === "ending-soon" || sort === "most-time";
  const timeSortLabel =
    sort === "ending-soon" ? "Least time" : sort === "most-time" ? "Most time" : "Time left";
  const timeSortIcon =
    sort === "ending-soon" ? "↓" : sort === "most-time" ? "↑" : "—";

  const filteredAndSorted = useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesPrice = item.currentBid >= minPrice && item.currentBid <= maxPrice;
      const matchesEra = era === "all" || item.era === era;
      const matchesArtType = artType === "all" || item.artType === artType;
      const matchesLiked = !showLikedOnly || likedIds.has(item.id);
      return matchesSearch && matchesPrice && matchesEra && matchesArtType && matchesLiked;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.currentBid - b.currentBid;
        case "price-desc":
          return b.currentBid - a.currentBid;
        case "ending-soon":
          return a.timeLeftMinutes - b.timeLeftMinutes;
        case "most-time":
          return b.timeLeftMinutes - a.timeLeftMinutes;
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [items, search, sort, minPrice, maxPrice, era, artType, showLikedOnly, likedIds]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize) || 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filteredAndSorted.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize) || 1);
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedItems = filteredAndSorted.slice(startIndex, startIndex + pageSize);

  return (
    <main className="min-h-screen bg-[#faf5f2] pt-32 pb-20">
      <div className="mx-auto w-full max-w-[120rem] px-4">
        <div className="mb-10 flex flex-col gap-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[rgb(30,36,44)] sm:text-3xl">
            Explore
          </h1>

          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <input
                type="search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border-0 bg-white/80 py-2.5 pl-9 pr-4 text-sm text-[rgb(30,36,44)] placeholder-zinc-400 ring-1 ring-zinc-200/80 transition-shadow focus:outline-none focus:ring-2 focus:ring-zinc-400/50"
                aria-label="Search auctions"
              />
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLikedOnly((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    showLikedOnly
                      ? "bg-red-500/15 text-red-600 ring-1 ring-red-500/30"
                      : "bg-white/80 text-zinc-600 ring-1 ring-zinc-200/80 hover:ring-zinc-300"
                  }`}
                  aria-pressed={showLikedOnly}
                >
                  <svg className="h-4 w-4" fill={showLikedOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Liked
                </button>
                <button
                  type="button"
                  onClick={cycleTimeSort}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    timeSortActive
                      ? "bg-[rgb(30,36,44)] text-white"
                      : "bg-white/80 text-zinc-600 ring-1 ring-zinc-200/80 hover:ring-zinc-300"
                  }`}
                >
                  <span className="text-xs">{timeSortIcon}</span>
                  <span>{timeSortLabel}</span>
                </button>
                <PriceRangeFilter
                  min={minPrice}
                  max={maxPrice}
                  onChange={(min, max) => {
                    setMinPrice(min);
                    setMaxPrice(max);
                  }}
                />
                <FilterSelect
                  label="Art era"
                  value={era}
                  options={ART_ERAS}
                  onChange={(v) => setEra(v as ArtEra | "all")}
                />
                <FilterSelect
                  label="Art type"
                  value={artType}
                  options={ART_TYPES}
                  onChange={(v) => setArtType(v as ArtType | "all")}
                />
              </div>
              {(search.trim() !== "" || era !== "all" || artType !== "all" || minPrice > 0 || maxPrice < 50000 || showLikedOnly) && (
              <div className="flex flex-wrap items-center gap-2">
                {search.trim() !== "" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-sm text-white">
                    {search.trim()}
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-blue-600"
                      aria-label="Remove search filter"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {era !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-sm text-white">
                    {ART_ERAS.find((r) => r.value === era)?.label ?? era}
                    <button
                      type="button"
                      onClick={() => setEra("all")}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-blue-600"
                      aria-label="Remove era filter"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {artType !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-sm text-white">
                    {ART_TYPES.find((r) => r.value === artType)?.label ?? artType}
                    <button
                      type="button"
                      onClick={() => setArtType("all")}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-blue-600"
                      aria-label="Remove art type filter"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {(minPrice > 0 || maxPrice < 50000) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-sm text-white">
                    {formatBid(minPrice)} – {formatBid(maxPrice)}
                    <button
                      type="button"
                      onClick={() => {
                        setMinPrice(0);
                        setMaxPrice(50000);
                      }}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-blue-600"
                      aria-label="Remove price filter"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {showLikedOnly && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-sm text-white">
                    Liked only
                    <button
                      type="button"
                      onClick={() => setShowLikedOnly(false)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-red-600"
                      aria-label="Remove liked filter"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg bg-white/50 py-20 text-center">
            <p className="text-sm text-zinc-500">Loading listings…</p>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="rounded-lg bg-white/50 py-20 text-center">
            <p className="text-sm text-zinc-500">
              No items match your filters. Try adjusting your search.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedItems.map((item) => (
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
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
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
                      <h2 className="truncate text-sm font-semibold text-white">
                        {item.title}
                      </h2>
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

            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className={
                    safePage === 1
                      ? "cursor-default text-zinc-400"
                      : "cursor-pointer text-[rgb(30,36,44)] hover:underline"
                  }
                >
                  Previous
                </button>

                {(() => {
                  const elements: (number | "ellipsis")[] = [];

                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) elements.push(i);
                  } else {
                    elements.push(1);
                    const start = Math.max(2, safePage - 1);
                    const end = Math.min(totalPages - 1, safePage + 1);

                    if (start > 2) elements.push("ellipsis");

                    for (let i = start; i <= end; i++) {
                      elements.push(i);
                    }

                    if (end < totalPages - 1) elements.push("ellipsis");
                    elements.push(totalPages);
                  }

                  return elements.map((value, index) =>
                    value === "ellipsis" ? (
                      <span key={`ellipsis-${index}`} className="text-zinc-400">
                        …
                      </span>
                    ) : (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPage(value)}
                        className={
                          value === safePage
                            ? "cursor-default font-semibold text-[rgb(30,36,44)] underline"
                            : "cursor-pointer text-[rgb(30,36,44)] hover:underline"
                        }
                      >
                        {value}
                      </button>
                    )
                  );
                })()}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className={
                    safePage === totalPages
                      ? "cursor-default text-zinc-400"
                      : "cursor-pointer text-[rgb(30,36,44)] hover:underline"
                  }
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
