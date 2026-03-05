import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { LISTINGS_COLLECTION } from "@/lib/listings";
import { PURCHASES_COLLECTION } from "@/lib/purchases";

export const dynamic = "force-dynamic";

export async function POST() {
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin not configured" },
      { status: 503 }
    );
  }

  const now = Timestamp.now();
  const snap = await db
    .collection(LISTINGS_COLLECTION)
    .where("endTime", "<=", now)
    .get();

  let finalized = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.finalized === true) continue;

    const listingId = doc.id;
    const highestBidderId = data.highestBidderId;
    const highestBidderEmail = data.highestBidderEmail;
    const currentBid = data.currentBid ?? 0;

    await doc.ref.update({ finalized: true });

    if (highestBidderId && highestBidderEmail && currentBid > 0) {
      const existing = await db
        .collection(PURCHASES_COLLECTION)
        .where("listingId", "==", listingId)
        .limit(1)
        .get();
      if (!existing.empty) continue;

      await db.collection(PURCHASES_COLLECTION).add({
        listingId,
        buyerId: highestBidderId,
        buyerEmail: highestBidderEmail,
        amount: currentBid,
        status: "pending",
        createdAt: Timestamp.now(),
      });
    }
    finalized++;
  }

  return NextResponse.json({ ok: true, finalized });
}
