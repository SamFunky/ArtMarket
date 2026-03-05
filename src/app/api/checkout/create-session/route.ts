import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";
import { LISTINGS_COLLECTION } from "@/lib/listings";
import { PURCHASES_COLLECTION } from "@/lib/purchases";

export const dynamic = "force-dynamic";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { purchaseId } = body;
  if (!purchaseId || typeof purchaseId !== "string") {
    return NextResponse.json(
      { error: "Missing purchaseId" },
      { status: 400 }
    );
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const purchaseRef = db.collection(PURCHASES_COLLECTION).doc(purchaseId);
  const purchaseSnap = await purchaseRef.get();
  if (!purchaseSnap.exists) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  const purchase = purchaseSnap.data()!;
  if (purchase.status !== "pending") {
    return NextResponse.json(
      { error: "Purchase is not pending" },
      { status: 400 }
    );
  }

  const listingSnap = await db
    .collection(LISTINGS_COLLECTION)
    .doc(purchase.listingId)
    .get();
  const listing = listingSnap.exists ? listingSnap.data() : null;
  const title = listing?.title ?? "Artwork";

  const origin = request.headers.get("origin") ?? request.headers.get("referer") ?? "http://localhost:3000";
  const base = new URL(origin).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: title,
            images: listing?.image ? [listing.image] : undefined,
          },
          unit_amount: Math.round(purchase.amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}&purchase_id=${purchaseId}`,
    cancel_url: `${base}/account`,
    metadata: {
      purchaseId,
      listingId: purchase.listingId,
      buyerId: purchase.buyerId,
    },
  });

  await purchaseRef.update({
    stripeSessionId: session.id,
  });

  return NextResponse.json({ url: session.url });
}
