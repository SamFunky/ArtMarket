import { readFile } from "fs/promises";
import path from "path";
import type { MappedHarvardListing } from "@/lib/harvard-art";

const BUCKET = "curatorartmarket.firebasestorage.app";
const BASE = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o`;

const STORAGE_URLS = [
  `${BASE}/${encodeURIComponent("harvard-listings.generated.json")}?alt=media`,
  `${BASE}/${encodeURIComponent("harvard-listings.json")}?alt=media`,
];

const LOCAL_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "harvard-listings.generated.json"
);
const CACHE_TTL_MS = 10 * 60 * 1000;

let memCache: MappedHarvardListing[] | null = null;
let memCacheExpiry = 0;

export async function readHarvardListings(): Promise<MappedHarvardListing[] | null> {
  const now = Date.now();
  if (memCache && now < memCacheExpiry) return memCache;

  let result: MappedHarvardListing[] | null = null;

  for (const url of STORAGE_URLS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (res.ok) {
        result = (await res.json()) as MappedHarvardListing[];
        break;
      }
    } catch {
      continue;
    }
  }

  if (!result) {
    try {
      result = JSON.parse(
        await readFile(LOCAL_PATH, "utf-8")
      ) as MappedHarvardListing[];
    } catch {
      return null;
    }
  }

  memCache = result;
  memCacheExpiry = now + CACHE_TTL_MS;
  return result;
}
