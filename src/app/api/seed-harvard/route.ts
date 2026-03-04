import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  fetchHarvardObjectsByIds,
  mapHarvardRecordToListing,
  type MappedHarvardListing,
} from "@/lib/harvard-art";
import {
  DEFAULT_FAKE_LISTING_DURATION_MINUTES,
  LISTINGS_COLLECTION,
  type ListingDoc,
} from "@/lib/listings";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const BATCH_SIZE = 400;

export async function POST(request: Request) {
  const secret = process.env.SEED_SECRET;
  if (secret) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    if (key !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const apiKey = process.env.HARVARD_ART_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "HARVARD_ART_API_KEY is not set. Get a key from https://harvardartmuseums.org/collections/api",
      },
      { status: 503 }
    );
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      {
        error:
          "Firebase Admin not configured (set FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, project id)",
      },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const countParam = url.searchParams.get("count");
  const targetCount = Math.min(
    Math.max(500, parseInt(countParam || "2000", 10) || 2000),
    5000
  );

  const idCeiling = 248_602;
  const toRequest = Math.min(targetCount * 6, idCeiling);
  const idSet = new Set<number>();
  while (idSet.size < toRequest) {
    idSet.add(1 + Math.floor(Math.random() * idCeiling));
  }
  const ids = Array.from(idSet);

  const records = await fetchHarvardObjectsByIds(apiKey, ids);
  const listings: MappedHarvardListing[] = [];

  for (const record of records) {
    const mapped = mapHarvardRecordToListing(record);
    if (mapped) {
      listings.push(mapped);
      if (listings.length >= targetCount) break;
    }
  }

  const now = new Date();
  const colRef = db.collection(LISTINGS_COLLECTION);

  for (let i = 0; i < listings.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = listings.slice(i, i + BATCH_SIZE);

    for (const item of chunk) {
      const randomSeconds = Math.floor(Math.random() * 60) * 1000;
      const endTime = new Date(
        now.getTime() + item.endTimeMinutesFromNow * 60_000 + randomSeconds
      );
      const raw: Record<string, unknown> = {
        title: item.title,
        category: item.category,
        currentBid: item.currentBid,
        endTime: Timestamp.fromDate(endTime),
        era: item.era,
        artType: item.artType,
        isFakeListing: true,
        fakeListingDurationMinutes: DEFAULT_FAKE_LISTING_DURATION_MINUTES,
        image: item.image,
      };
      const doc = Object.fromEntries(
        Object.entries(raw).filter(([, v]) => v !== undefined)
      ) as Omit<ListingDoc, "endTime"> & { endTime: Timestamp };
      const ref = colRef.doc(item.id);
      batch.set(ref, doc);
    }

    await batch.commit();
  }

  return NextResponse.json({
    ok: true,
    message: `Seeded ${listings.length} Harvard Art Museums listings (random IDs 1–${idCeiling}, 12h reset). Use ?count=2000 for more (500–5000).`,
    count: listings.length,
  });
}
