import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { allItems } from "@/data/items";
import { getDb } from "./firebase";
import { LISTINGS_COLLECTION } from "./listings";

const BIDS_COLLECTION = "bids";

export type BidDoc = {
  listingId: string;
  bidderId: string;
  bidderEmail: string;
  amount: number;
  createdAt: Timestamp | ReturnType<typeof serverTimestamp>;
};

const MIN_INCREMENT = 10;

export function getMinimumBid(currentBid: number): number {
  return currentBid + MIN_INCREMENT;
}

export const BID_INCREMENT_PRESETS = [10, 100, 1000] as const;

export async function placeBid(params: {
  listingId: string;
  bidderId: string;
  bidderEmail: string;
  amount: number;
  currentBid: number;
}): Promise<void> {
  const isFake =
    allItems.some((i) => i.id === params.listingId) || params.listingId.startsWith("harvard-");
  if (isFake) {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const res = await fetch(`${base}/api/listings/sync-fake`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: params.listingId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? "Failed to sync listing");
    }
  }

  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");

  const { listingId, bidderId, bidderEmail, amount, currentBid } = params;
  const minBid = getMinimumBid(currentBid);
  if (amount < minBid) {
    throw new Error(`Bid must be at least ${minBid}.`);
  }

  const listingRef = doc(db, LISTINGS_COLLECTION, listingId);

  await runTransaction(db, async (tx) => {
    const listingSnap = await tx.get(listingRef);
    if (!listingSnap.exists()) {
      throw new Error("Listing not found.");
    }
    const data = listingSnap.data();
    const existingBid = data.currentBid ?? 0;
    const endTime = data.endTime?.toDate?.();
    const finalized = data.finalized === true;

    if (finalized) {
      throw new Error("This auction has ended.");
    }
    if (endTime && new Date() >= endTime) {
      throw new Error("This auction has ended.");
    }

    const min = getMinimumBid(existingBid);
    if (amount < min) {
      throw new Error(`Bid must be at least ${min}.`);
    }

    const bidsCol = collection(db, BIDS_COLLECTION);
    const bidRef = doc(bidsCol);
    tx.set(bidRef, {
      listingId,
      bidderId,
      bidderEmail,
      amount,
      createdAt: serverTimestamp(),
    });
    tx.update(listingRef, {
      currentBid: amount,
      highestBidderId: bidderId,
      highestBidderEmail: bidderEmail,
    });
  });
}
