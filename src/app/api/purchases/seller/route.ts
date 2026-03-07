import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { LISTINGS_COLLECTION } from "@/lib/listings";
import { PURCHASES_COLLECTION, type Purchase, type PurchaseDoc } from "@/lib/purchases";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const { creatorId, listingIds: clientListingIds } = body;
  if (!creatorId || typeof creatorId !== "string") {
    return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const listingsSnap = await db
    .collection(LISTINGS_COLLECTION)
    .where("creatorId", "==", creatorId)
    .get();
  const serverListingIds = listingsSnap.docs.map((d) => d.id);
  const listingById = new Map(
    listingsSnap.docs.map((d) => [d.id, d.exists ? d.data() : null])
  );

  const listingIds =
    Array.isArray(clientListingIds) && clientListingIds.length > 0
      ? clientListingIds.filter((id: unknown) => typeof id === "string")
      : serverListingIds;

  if (listingIds.length === 0) {
    return NextResponse.json([]);
  }

  const purchases: Purchase[] = [];
  for (let i = 0; i < listingIds.length; i += 10) {
    const batch = listingIds.slice(i, i + 10);
    const purchasesSnap = await db
      .collection(PURCHASES_COLLECTION)
      .where("listingId", "in", batch)
      .get();

    for (const d of purchasesSnap.docs) {
      const data = d.data() as PurchaseDoc;
      const listingData = listingById.get(data.listingId);
      if (!listingData) continue;
      purchases.push({
        id: d.id,
        ...data,
        listingTitle: listingData?.title,
        listingImage: listingData?.image,
        listingCreatorId: data.listingCreatorId ?? (listingData?.creatorId as string),
      });
    }
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
  const deduped = purchases.filter((p) => {
    if (seen.has(p.listingId)) return false;
    seen.add(p.listingId);
    return true;
  });

  return NextResponse.json(deduped);
}
