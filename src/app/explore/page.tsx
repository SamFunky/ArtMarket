"use client";

import { useEffect, useMemo, useState } from "react";
import FilterSelect from "@/components/FilterSelect";
import LotCard from "@/components/LotCard";
import PriceRangeFilter from "@/components/PriceRangeFilter";
import { useLiked } from "@/context/LikedContext";
import { type ArtEra, type ArtType } from "@/data/items";
import { useListings } from "@/hooks/useListings";

type SortOption =
  | "price-asc"
  | "price-desc"
  | "ending-soon"
  | "most-time"
  | "name-asc"
  | "name-desc";

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

function FilterChip({ label, onRemove, ariaLabel }: { label: string; onRemove: () => void; ariaLabel: string }) {
  return (
    <span className="label-caps inline-flex items-center gap-2 bg-ink px-3 py-1.5 text-[10px] text-paper">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="cursor-pointer p-0.5 transition-colors hover:text-gilt"
        aria-label={ariaLabel}
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
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
    const filtered = items.filter((item) => {
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
    <main className="min-h-screen bg-paper pb-24 pt-32">
      <div className="mx-auto w-full max-w-[110rem] px-5 sm:px-10 lg:px-14">
        <div className="mb-12 flex flex-col gap-8">
          <div className="border-b border-line pb-8">
            <p className="label-caps text-bronze">The catalogue</p>
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
              <h1 className="font-display text-5xl font-medium tracking-tight text-ink sm:text-6xl lg:text-7xl">
                Explore
              </h1>
              {!loading && (
                <p className="label-caps text-ink-mute">
                  {filteredAndSorted.length} {filteredAndSorted.length === 1 ? "lot" : "lots"} on offer
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="relative w-full max-w-2xl border-b border-ink/30 transition-colors focus-within:border-ink">
              <svg
                className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search the catalogue…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-3 pl-8 pr-4 text-base text-ink placeholder-ink-mute/60 focus:outline-none"
                aria-label="Search auctions"
              />
            </div>

            <div className="flex flex-wrap items-center justify-start gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLikedOnly((v) => !v)}
                  className={`label-caps inline-flex cursor-pointer items-center gap-2 px-4 py-2.5 transition-all ${
                    showLikedOnly
                      ? "bg-oxblood text-paper"
                      : "bg-cream text-ink ring-1 ring-line hover:ring-ink/40"
                  }`}
                  aria-pressed={showLikedOnly}
                >
                  <svg className="h-3.5 w-3.5" fill={showLikedOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Liked
                </button>
                <button
                  type="button"
                  onClick={cycleTimeSort}
                  className={`label-caps inline-flex cursor-pointer items-center gap-2 px-4 py-2.5 transition-all ${
                    timeSortActive
                      ? "bg-ink text-paper"
                      : "bg-cream text-ink ring-1 ring-line hover:ring-ink/40"
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
                    <FilterChip
                      label={search.trim()}
                      onRemove={() => setSearch("")}
                      ariaLabel="Remove search filter"
                    />
                  )}
                  {era !== "all" && (
                    <FilterChip
                      label={ART_ERAS.find((r) => r.value === era)?.label ?? era}
                      onRemove={() => setEra("all")}
                      ariaLabel="Remove era filter"
                    />
                  )}
                  {artType !== "all" && (
                    <FilterChip
                      label={ART_TYPES.find((r) => r.value === artType)?.label ?? artType}
                      onRemove={() => setArtType("all")}
                      ariaLabel="Remove art type filter"
                    />
                  )}
                  {(minPrice > 0 || maxPrice < 50000) && (
                    <FilterChip
                      label={`${formatBid(minPrice)} – ${formatBid(maxPrice)}`}
                      onRemove={() => {
                        setMinPrice(0);
                        setMaxPrice(50000);
                      }}
                      ariaLabel="Remove price filter"
                    />
                  )}
                  {showLikedOnly && (
                    <FilterChip
                      label="Liked only"
                      onRemove={() => setShowLikedOnly(false)}
                      ariaLabel="Remove liked filter"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="border border-dashed border-line py-24 text-center">
            <p className="label-caps text-ink-mute">Preparing the saleroom…</p>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="border border-dashed border-line py-24 text-center">
            <p className="font-display text-2xl italic text-ink-mute">Nothing under the hammer here.</p>
            <p className="mt-2 text-sm text-ink-mute">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {paginatedItems.map((item) => (
                <LotCard key={item.id} item={item} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-14 flex flex-wrap items-center justify-center gap-4 border-t border-line pt-8 text-sm">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className={`label-caps ${
                    safePage === 1
                      ? "cursor-default text-ink-mute/50"
                      : "link-underline cursor-pointer text-ink"
                  }`}
                >
                  ← Prev
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
                      <span key={`ellipsis-${index}`} className="text-ink-mute">
                        …
                      </span>
                    ) : (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPage(value)}
                        className={`flex h-9 w-9 items-center justify-center tabular-nums transition-colors ${
                          value === safePage
                            ? "cursor-default bg-ink font-medium text-paper"
                            : "cursor-pointer text-ink hover:bg-paper-deep"
                        }`}
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
                  className={`label-caps ${
                    safePage === totalPages
                      ? "cursor-default text-ink-mute/50"
                      : "link-underline cursor-pointer text-ink"
                  }`}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
