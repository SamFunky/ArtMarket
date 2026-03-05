import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { allItems, type Item } from "@/data/items";
import type { MappedHarvardListing } from "@/lib/harvard-art";

export const dynamic = "force-dynamic";

const CYCLE_DAYS = 30;
const FAKE_LISTING_CYCLE_MS = CYCLE_DAYS * 24 * 60 * 60 * 1000;
const CYCLE_MINUTES = CYCLE_DAYS * 24 * 60;

const HARVARD_LISTINGS_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "harvard-listings.generated.json"
);

function phaseMs(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const minutes = hash % CYCLE_MINUTES;
  return minutes * 60 * 1000;
}

function baseId(id: string): string {
  return id.replace(/--\d+$/, "") || id;
}

function buildLocalFakeItems(): Item[] {
  const now = Date.now();
  const cycleStart = Math.floor(now / FAKE_LISTING_CYCLE_MS) * FAKE_LISTING_CYCLE_MS;
  const cycleIndex = Math.floor(now / FAKE_LISTING_CYCLE_MS);

  const fromBuiltIn: Item[] = allItems.map((item) => {
    const base = baseId(item.id);
    const phase = phaseMs(base);
    const rawEndMs = cycleStart + phase;
    const expired = rawEndMs <= now;

    const displayId = expired ? `${base}--${cycleIndex}` : item.id;
    const displayEndMs = expired ? cycleStart + FAKE_LISTING_CYCLE_MS + phase : rawEndMs;
    const displayTimeLeft = Math.max(0, Math.floor((displayEndMs - now) / 60_000));

    return {
      ...item,
      id: displayId,
      timeLeftMinutes: displayTimeLeft,
      endTimeMs: displayEndMs,
      isFakeListing: true,
    };
  });

  return fromBuiltIn;
}

function extractNumericId(id: string): number {
  const m = id.match(/^harvard-(\d+)/);
  return m ? parseInt(m[1], 10) || 0 : 0;
}

async function getHarvardItems(): Promise<Item[]> {
  try {
    const json = await readFile(HARVARD_LISTINGS_PATH, "utf-8");
    const harvard = JSON.parse(json) as MappedHarvardListing[];
    const now = Date.now();
    const cycleStart = Math.floor(now / FAKE_LISTING_CYCLE_MS) * FAKE_LISTING_CYCLE_MS;

    const toFinalize = new Map<string, MappedHarvardListing>();
    const newListings: MappedHarvardListing[] = [];
    const itemsOut: Item[] = [];
    let nextId = Math.max(0, ...harvard.map((h) => extractNumericId(h.id))) + 1;
    const toUpdate = new Map<string, MappedHarvardListing>();

    for (const item of harvard) {
      const itemNow = Date.now();
      const base = baseId(item.id);
      const useShortTimer =
        item.endTimeMinutesFromNow != null &&
        item.endTimeMinutesFromNow <= 120 &&
        item.endTimeMinutesFromNow > 0;

      let displayEndMs: number;

      if (useShortTimer) {
        if (item.endTimeMs != null) {
          displayEndMs = item.endTimeMs;
        } else {
          displayEndMs = itemNow + item.endTimeMinutesFromNow * 60 * 1000;
          toUpdate.set(item.id, { ...item, endTimeMs: displayEndMs });
        }
      } else {
        const phase = phaseMs(base);
        const rawEndMs = cycleStart + phase;
        const cycleExpired = rawEndMs <= now;
        displayEndMs = cycleExpired
          ? cycleStart + FAKE_LISTING_CYCLE_MS + phase
          : rawEndMs;
      }

      const displayTimeLeft = Math.max(0, Math.floor((displayEndMs - itemNow) / 60_000));
      const expired = displayTimeLeft <= 0;
      const durationDays = item.listingDurationDays ?? 30;
      const durationMinutes = durationDays * 24 * 60;

      if (expired && !item.finalized) {
        const newListing: MappedHarvardListing = {
          id: `harvard-${nextId}`,
          title: item.title,
          category: item.category,
          currentBid: item.currentBid,
          endTimeMinutesFromNow: durationMinutes,
          listingDurationDays: durationDays,
          era: item.era,
          artType: item.artType,
          image: item.image,
        };
        newListings.push(newListing);
        toFinalize.set(item.id, {
          ...item,
          finalized: true,
          replacedById: newListing.id,
        });
        nextId++;

        const newEndMs = itemNow + durationMinutes * 60 * 1000;
        itemsOut.push({
          id: newListing.id,
          title: newListing.title,
          category: newListing.category,
          currentBid: newListing.currentBid,
          timeLeftMinutes: durationMinutes,
          endTimeMs: newEndMs,
          era: newListing.era,
          artType: newListing.artType,
          image: newListing.image,
          isFakeListing: true,
        } satisfies Item);
      } else {
        itemsOut.push({
          id: item.id,
          title: item.title,
          category: item.category,
          currentBid: item.currentBid,
          timeLeftMinutes: displayTimeLeft,
          endTimeMs: displayEndMs,
          era: item.era,
          artType: item.artType,
          image: item.image,
          isFakeListing: true,
        } satisfies Item);
      }
    }

    const needsWrite = newListings.length > 0 || toUpdate.size > 0;
    if (needsWrite) {
      const updated = harvard
        .map((h) => toFinalize.get(h.id) ?? toUpdate.get(h.id) ?? h)
        .concat(newListings);
      await writeFile(
        HARVARD_LISTINGS_PATH,
        JSON.stringify(updated, null, 2),
        "utf-8"
      );
    }

    return itemsOut;
  } catch {
    return [];
  }
}

async function getHarvardItemById(id: string): Promise<Item | null> {
  try {
    const json = await readFile(HARVARD_LISTINGS_PATH, "utf-8");
    const harvard = JSON.parse(json) as MappedHarvardListing[];
    const item = harvard.find((h) => h.id === id);
    if (!item) return null;
    return {
      id: item.id,
      title: item.title,
      category: item.category,
      currentBid: item.currentBid,
      timeLeftMinutes: 0,
      endTimeMs: item.endTimeMs ?? 0,
      era: item.era,
      artType: item.artType,
      image: item.image,
      isFakeListing: true,
      auctionEnded: item.finalized === true,
    } satisfies Item;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  const builtIn = buildLocalFakeItems();
  const harvard = await getHarvardItems();
  const all = [...builtIn, ...harvard];

  if (id) {
    let one = all.find((i) => i.id === id);
    if (!one) one = all.find((i) => baseId(i.id) === id);
    if (!one) {
      const finalizedItem = await getHarvardItemById(id);
      if (finalizedItem) one = finalizedItem;
    }
    if (!one) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(one);
  }

  return NextResponse.json(all);
}
