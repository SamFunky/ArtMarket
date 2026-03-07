import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { LISTINGS_COLLECTION } from "@/lib/listings";
import { PURCHASES_COLLECTION } from "@/lib/purchases";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: listingId } = await params;
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin not configured" },
      { status: 503 }
    );
  }

  const listingRef = db.collection(LISTINGS_COLLECTION).doc(listingId);
  const listingSnap = await listingRef.get();
  if (!listingSnap.exists) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const data = listingSnap.data()!;
  const endTime = data.endTime?.toDate?.();
  const finalized = data.finalized === true;
  const highestBidderId = data.highestBidderId;
  const highestBidderEmail = data.highestBidderEmail;
  const currentBid = data.currentBid ?? 0;

  if (finalized) {
    return NextResponse.json({ ok: true, alreadyFinalized: true });
  }
  if (!endTime || new Date() < endTime) {
    return NextResponse.json(
      { error: "Auction has not ended yet" },
      { status: 400 }
    );
  }

  await listingRef.update({ finalized: true });

  if (highestBidderId && highestBidderEmail && currentBid > 0) {
    const existing = await db
      .collection(PURCHASES_COLLECTION)
      .where("listingId", "==", listingId)
      .limit(1)
      .get();
    if (existing.empty) {
      await db.collection(PURCHASES_COLLECTION).add({
        listingId,
        buyerId: highestBidderId,
        buyerEmail: highestBidderEmail,
        amount: currentBid,
        status: "pending",
        listingCreatorId: data.creatorId ?? null,
        createdAt: Timestamp.now(),
      });
    }
  }

  return NextResponse.json({ ok: true });
}
