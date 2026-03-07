import { NextResponse } from "next/server";
import { getAdminStorageBucket } from "@/lib/firebase-admin";
import { STORAGE_ASSETS } from "@/lib/storage-assets";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    const res = await fetch(STORAGE_ASSETS.theApparition, { method: "HEAD" });
    results.apparitionImageHead = { status: res.status, ok: res.ok };
  } catch (e) {
    results.apparitionImageHead = { error: String(e) };
  }

  try {
    const res = await fetch(STORAGE_ASSETS.heroImage, { method: "HEAD" });
    results.heroImageHead = { status: res.status, ok: res.ok };
  } catch (e) {
    results.heroImageHead = { error: String(e) };
  }

  for (const suffix of ["firebasestorage.app", "appspot.com"] as const) {
    const bucket = getAdminStorageBucket(suffix);
    if (!bucket) {
      results[`bucket_${suffix}`] = "null (admin app or projectId missing)";
      continue;
    }
    try {
      const [files] = await bucket.getFiles({ maxResults: 3 });
      results[`bucket_${suffix}`] = {
        ok: true,
        files: files.map((f) => f.name),
      };
    } catch (e) {
      results[`bucket_${suffix}`] = { error: String(e) };
    }
  }

  results.env = {
    GOOGLE_CLOUD_PROJECT: !!process.env.GOOGLE_CLOUD_PROJECT,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
  };

  return NextResponse.json(results, { status: 200 });
}
