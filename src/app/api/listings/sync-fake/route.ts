import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  DEFAULT_FAKE_LISTING_DURATION_MINUTES,
  LISTINGS_COLLECTION,
} from "@/lib/listings";

export const dynamic = "force-dynamic";

const FAKE_LISTING_OWNER_UID =
  process.env.FAKE_LISTING_OWNER_UID ?? "UvKA5QmnMqQlhooR0GwmuCPVjIg1";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const listingId = typeof body.listingId === "string" ? body.listingId : null;
  if (!listingId) {
    return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin not configured" },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const base = url.origin;
  const res = await fetch(
    `${base}/api/listings/local-fakes?id=${encodeURIComponent(listingId)}`
  );
  if (!res.ok) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const item = (await res.json()) as {
    id: string;
    title: string;
    category: string;
    currentBid: number;
    endTimeMs?: number;
    era: string;
    artType: string;
    image?: string;
    timeLeftMinutes?: number;
    dateRange?: string;
    description?: string;
  };

  const ref = db.collection(LISTINGS_COLLECTION).doc(listingId);
  const snap = await ref.get();
  if (snap.exists) {
    return NextResponse.json({ ok: true, existed: true });
  }

  const durationMinutes = item.timeLeftMinutes ?? DEFAULT_FAKE_LISTING_DURATION_MINUTES;
  const endTime = item.endTimeMs
    ? new Date(item.endTimeMs)
    : new Date(Date.now() + durationMinutes * 60 * 1000);

  await ref.set({
    title: item.title,
    category: item.category,
    currentBid: item.currentBid,
    endTime: Timestamp.fromDate(endTime),
    era: item.era,
    artType: item.artType,
    isFakeListing: true,
    fakeListingDurationMinutes: durationMinutes,
    creatorId: FAKE_LISTING_OWNER_UID,
    ...(item.image && { image: item.image }),
    ...(item.dateRange && { dateRange: item.dateRange }),
    ...(item.description && { description: item.description }),
  });

  return NextResponse.json({ ok: true, created: true });
}
