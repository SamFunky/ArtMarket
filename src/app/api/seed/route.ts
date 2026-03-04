import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { allItems } from "@/data/items";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  DEFAULT_FAKE_LISTING_DURATION_MINUTES,
  LISTINGS_COLLECTION,
  type ListingDoc,
} from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.SEED_SECRET;
  if (secret) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    if (key !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin not configured (set FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, project id)" },
      { status: 503 }
    );
  }

  const now = new Date();
  const batch = db.batch();
  const colRef = db.collection(LISTINGS_COLLECTION);

  for (const item of allItems) {
    const randomSeconds = Math.floor(Math.random() * 60) * 1000;
    const endTime = new Date(now.getTime() + item.timeLeftMinutes * 60_000 + randomSeconds);
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
      imagePosition: item.imagePosition,
      imageFit: item.imageFit,
      model: item.model,
      modelSrc: item.modelSrc,
      modelScale: item.modelScale,
      modelRotation: item.modelRotation,
      modelPosition: item.modelPosition,
    };
    const doc = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== undefined)
    ) as Omit<ListingDoc, "endTime"> & { endTime: Timestamp };
    const ref = colRef.doc(item.id);
    batch.set(ref, doc);
  }

  await batch.commit();

  return NextResponse.json({
    ok: true,
    message: `Seeded ${allItems.length} listings (all with isFakeListing: true, 12h reset).`,
  });
}
