import { readFile } from "fs/promises";
import path from "path";
import { getAdminStorageBucket } from "@/lib/firebase-admin";
import type { MappedHarvardListing } from "@/lib/harvard-art";

const STORAGE_PATHS = ["harvard-listings.json", "harvard-listings.generated.json"];
const LOCAL_PATH = path.join(process.cwd(), "src", "data", "harvard-listings.generated.json");

export async function readHarvardListings(): Promise<MappedHarvardListing[] | null> {
  const bucket = getAdminStorageBucket();
  if (bucket) {
    for (const p of STORAGE_PATHS) {
      try {
        const [buffer] = await bucket.file(p).download();
        const json = buffer.toString("utf-8");
        return JSON.parse(json) as MappedHarvardListing[];
      } catch {
        continue;
      }
    }
    return null;
  }
  try {
    const json = await readFile(LOCAL_PATH, "utf-8");
    return JSON.parse(json) as MappedHarvardListing[];
  } catch {
    return null;
  }
}
