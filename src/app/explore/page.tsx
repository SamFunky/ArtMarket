"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import FilterSelect from "@/components/FilterSelect";
import LikeButton from "@/components/LikeButton";
import PriceRangeFilter from "@/components/PriceRangeFilter";
import { useLiked } from "@/context/LikedContext";
import { allItems, type Item, type ArtEra, type ArtType } from "@/data/items";

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

function formatTimeLeft(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ExplorePage() {
  const { likedIds } = useLiked();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("price-asc");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [era, setEra] = useState<ArtEra | "all">("all");
  const [artType, setArtType] = useState<ArtType | "all">("all");
  const [showLikedOnly, setShowLikedOnly] = useState(false);

  const filteredAndSorted = useMemo(() => {
    let items = allItems.filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesPrice = item.currentBid >= minPrice && item.currentBid <= maxPrice;
      const matchesEra = era === "all" || item.era === era;
      const matchesArtType = artType === "all" || item.artType === artType;
      const matchesLiked = !showLikedOnly || likedIds.has(item.id);
      return matchesSearch && matchesPrice && matchesEra && matchesArtType && matchesLiked;
    });

    const sorted = [...items].sort((a, b) => {
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
  }, [search, sort, minPrice, maxPrice, era, artType, showLikedOnly, likedIds]);

  return (
    <main className="min-h-screen bg-[#f5e6dc] pt-32 pb-20">
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
                className="w-full rounded-md border-0 bg-white/80 py-2.5 pl-9 pr-4 text-sm text-[rgb(30,36,44)] placeholder-zinc-400 ring-1 ring-zinc-200/80 transition-shadow focus:outline-none focus:ring-2 focus:ring-zinc-400/50"
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

        {filteredAndSorted.length === 0 ? (
          <div className="rounded-lg bg-white/50 py-20 text-center">
            <p className="text-sm text-zinc-500">
              No items match your filters. Try adjusting your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSorted.map((item) => (
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
                  <h2 className="font-display text-[15px] font-medium text-[rgb(30,36,44)] line-clamp-2 leading-snug group-hover:text-zinc-600">
                    {item.title}
                  </h2>
                  <div className="mt-auto flex items-baseline justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400">Bid</p>
                      <p className="text-base font-semibold text-[rgb(30,36,44)]">
                        {formatBid(item.currentBid)}
                      </p>
                    </div>
                    <p className="text-xs text-zinc-400">
                      {formatTimeLeft(item.timeLeftMinutes)} left
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
