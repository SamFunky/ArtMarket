import { NextResponse } from "next/server";
import { allItems, type Item } from "@/data/items";
import { readHarvardListings } from "@/lib/harvard-listings-reader";
import type { MappedHarvardListing } from "@/lib/harvard-art";

export const dynamic = "force-dynamic";

const CYCLE_DAYS = 30;
const FAKE_LISTING_CYCLE_MS = CYCLE_DAYS * 24 * 60 * 60 * 1000;
const CYCLE_MINUTES = CYCLE_DAYS * 24 * 60;

function phaseMs(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const minutes = hash % CYCLE_MINUTES;
  const secondsOffset = ((hash * 17) >>> 0) % 60;
  return minutes * 60 * 1000 + secondsOffset * 1000;
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

function harvardToItems(harvard: MappedHarvardListing[]): Item[] {
  const now = Date.now();
  const cycleStart = Math.floor(now / FAKE_LISTING_CYCLE_MS) * FAKE_LISTING_CYCLE_MS;
  const itemsOut: Item[] = [];

  for (const item of harvard) {
    const base = baseId(item.id);
    const totalSecondsFromNow =
      item.endTimeSecondsFromNow ??
      (item.endTimeMinutesFromNow != null ? item.endTimeMinutesFromNow * 60 : null);
    const useShortTimer =
      totalSecondsFromNow != null &&
      totalSecondsFromNow <= 120 * 60 &&
      totalSecondsFromNow > 0;

    let displayEndMs: number;

    if (useShortTimer && (item.endTimeMs != null || totalSecondsFromNow != null)) {
      displayEndMs =
        item.endTimeMs ?? (Date.now() + (totalSecondsFromNow ?? 0) * 1000);
    } else {
      const phase = phaseMs(base);
      const rawEndMs = cycleStart + phase;
      const cycleExpired = rawEndMs <= now;
      displayEndMs = cycleExpired
        ? cycleStart + FAKE_LISTING_CYCLE_MS + phase
        : rawEndMs;
    }

    const displayTimeLeft = Math.max(0, Math.floor((displayEndMs - now) / 60_000));

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
      dateRange: item.dateRange,
      description: item.description,
      isFakeListing: true,
    });
  }

  return itemsOut;
}

async function getHarvardItems(): Promise<Item[]> {
  const harvard = await readHarvardListings();
  if (!harvard || harvard.length === 0) return [];
  return harvardToItems(harvard);
}

async function getHarvardItemById(id: string): Promise<Item | null> {
  const harvard = await readHarvardListings();
  if (!harvard) return null;
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
    dateRange: item.dateRange,
    description: item.description,
    isFakeListing: true,
    auctionEnded: item.finalized === true,
  };
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
