import type { MappedHarvardListing } from "@/lib/harvard-art";

const BUCKET = "curatorartmarket.firebasestorage.app";
const BASE = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o`;

const STORAGE_URLS = [
  `${BASE}/${encodeURIComponent("harvard-listings.generated.json")}?alt=media`,
  `${BASE}/${encodeURIComponent("harvard-listings.json")}?alt=media`,
];

const CACHE_TTL_MS = 10 * 60 * 1000;

let memCache: MappedHarvardListing[] | null = null;
let memCacheExpiry = 0;
let fetchInProgress: Promise<MappedHarvardListing[] | null> | null = null;

export async function readHarvardListings(): Promise<MappedHarvardListing[] | null> {
  const now = Date.now();
  if (memCache && now < memCacheExpiry) return memCache;

  // Deduplicate concurrent fetches on the same instance
  if (fetchInProgress) return fetchInProgress;

  fetchInProgress = (async () => {
    for (const url of STORAGE_URLS) {
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(8_000),
          cache: "no-store",
        });
        if (res.ok) {
          const data = (await res.json()) as MappedHarvardListing[];
          if (Array.isArray(data) && data.length > 0) {
            memCache = data;
            memCacheExpiry = Date.now() + CACHE_TTL_MS;
            return data;
          }
        }
      } catch {
        continue;
      }
    }
    return null;
  })().finally(() => {
    fetchInProgress = null;
  });

  return fetchInProgress;
}
