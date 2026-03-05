import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import {
  fetchHarvardObjectsByIds,
  mapHarvardRecordToListing,
  type MappedHarvardListing,
} from "@/lib/harvard-art";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const HARVARD_LISTINGS_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "harvard-listings.generated.json"
);

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

  await writeFile(
    HARVARD_LISTINGS_PATH,
    JSON.stringify(listings, null, 2),
    "utf-8"
  );

  return NextResponse.json({
    ok: true,
    message: `Saved ${listings.length} Harvard Art Museums listings to ${HARVARD_LISTINGS_PATH} (local only, no Firebase). Run the regular seed (POST /api/seed) to push them to Firestore.`,
    count: listings.length,
    path: "src/data/harvard-listings.generated.json",
  });
}
