import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";
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
  const { sessionId, purchaseId } = body;
  if (!sessionId || !purchaseId) {
    return NextResponse.json({ error: "Missing sessionId or purchaseId" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const purchaseRef = db.collection(PURCHASES_COLLECTION).doc(purchaseId);
  const snap = await purchaseRef.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  if (snap.data()?.status === "paid") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  await purchaseRef.update({ status: "paid" });
  return NextResponse.json({ ok: true });
}
