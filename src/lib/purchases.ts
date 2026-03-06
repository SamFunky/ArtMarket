import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type Timestamp,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { LISTINGS_COLLECTION } from "./listings";

export const PURCHASES_COLLECTION = "purchases";

export type PurchaseDoc = {
  listingId: string;
  buyerId: string;
  buyerEmail: string;
  amount: number;
  status: "pending" | "paid" | "refunded";
  stripeSessionId?: string;
  createdAt: Timestamp;
};

export type Purchase = PurchaseDoc & {
  id: string;
  listingTitle?: string;
  listingImage?: string;
  listingCreatorId?: string;
};

export async function getPurchasesForUser(userId: string): Promise<Purchase[]> {
  const db = getDb();
  if (!db) return [];

  const colRef = collection(db, PURCHASES_COLLECTION);
  const q = query(colRef, where("buyerId", "==", userId));
  const snap = await getDocs(q);

  const purchases: Purchase[] = [];
  for (const d of snap.docs) {
    const data = d.data() as PurchaseDoc;
    const listing = await getDoc(doc(db, LISTINGS_COLLECTION, data.listingId));
    const listingData = listing.exists() ? listing.data() : null;
    purchases.push({
      id: d.id,
      ...data,
      listingTitle: listingData?.title,
      listingImage: listingData?.image,
      listingCreatorId: listingData?.creatorId,
    });
  }
  purchases.sort((a, b) => {
    const aPending = a.status === "pending";
    const bPending = b.status === "pending";
    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;
    const ta = a.createdAt?.toMillis?.() ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? 0;
    return tb - ta;
  });

  const seen = new Set<string>();
  return purchases.filter((p) => {
    if (seen.has(p.listingId)) return false;
    seen.add(p.listingId);
    return true;
  });
}
