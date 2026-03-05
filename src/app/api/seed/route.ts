import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { LISTINGS_COLLECTION } from "@/lib/listings";

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

  const colRef = db.collection(LISTINGS_COLLECTION);
  const snap = await colRef.where("isFakeListing", "==", true).get();

  if (!snap.empty) {
    const BATCH_SIZE = 400;
    for (let i = 0; i < snap.docs.length; i += BATCH_SIZE) {
      const batch = db.batch();
      snap.docs.slice(i, i + BATCH_SIZE).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }

  return NextResponse.json({
    ok: true,
    message: `Fake listings are local only (no Firestore). Removed ${snap.size} old fake listing doc(s) from Firestore. Run Harvard seed to update src/data/harvard-listings.generated.json.`,
  });
}
