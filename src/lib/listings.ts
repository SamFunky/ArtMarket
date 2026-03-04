import {
  collection,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  writeBatch,
  type Timestamp as FSTimestamp,
  type WriteBatch,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type { ArtEra, ArtType, Item } from "@/data/items";

export const LISTINGS_COLLECTION = "listings";

/** Default duration (minutes) to reset a fake listing when time runs out */
export const DEFAULT_FAKE_LISTING_DURATION_MINUTES = 60 * 12; // 12 hours

export type ListingDoc = {
  title: string;
  category: "painting" | "sculpture" | "artifact";
  currentBid: number;
  /** Firestore Timestamp - when the auction ends */
  endTime: FSTimestamp;
  era: ArtEra;
  artType: ArtType;
  /** When true, endTime is reset to now + fakeListingDurationMinutes when it passes */
  isFakeListing?: boolean;
  /** Minutes to add when resetting a fake listing (default 12h) */
  fakeListingDurationMinutes?: number;
  image?: string;
  imagePosition?: string;
  imageFit?: "cover" | "contain";
  model?: boolean;
  modelSrc?: string;
  modelScale?: number;
  modelRotation?: [number, number, number];
  modelPosition?: [number, number, number];
};

function minutesBetween(earlier: Date, later: Date): number {
  return Math.max(0, Math.floor((later.getTime() - earlier.getTime()) / 60_000));
}

function docToItem(
  id: string,
  data: ListingDoc,
  endTimeToUse: Date
): Item {
  const now = new Date();
  const timeLeftMinutes = minutesBetween(now, endTimeToUse);
  return {
    id,
    title: data.title,
    category: data.category,
    currentBid: data.currentBid,
    timeLeftMinutes,
    endTimeMs: endTimeToUse.getTime(),
    era: data.era,
    artType: data.artType,
    image: data.image,
    imagePosition: data.imagePosition,
    imageFit: data.imageFit,
    model: data.model,
    modelSrc: data.modelSrc,
    modelScale: data.modelScale,
    modelRotation: data.modelRotation,
    modelPosition: data.modelPosition,
  };
}

/**
 * Fetch all listings. For fake listings whose endTime has passed,
 * reset endTime in the DB and use the new endTime for the returned item.
 */
export async function fetchListings(): Promise<Item[]> {
  const db = getDb();
  if (!db) return [];

  const colRef = collection(db, LISTINGS_COLLECTION);
  const snap = await getDocs(colRef);

  const now = new Date();
  const batch: WriteBatch = writeBatch(db);
  let hasWrites = false;

  const items: Item[] = [];

  for (const docSnap of snap.docs) {
    const id = docSnap.id;
    const data = docSnap.data() as ListingDoc;
    const endTime = data.endTime?.toDate?.() ?? new Date(0);
    const isFake = data.isFakeListing === true;
    const duration =
      data.fakeListingDurationMinutes ?? DEFAULT_FAKE_LISTING_DURATION_MINUTES;

    let endTimeToUse = endTime;

    if (isFake && endTime <= now) {
      const newEnd = new Date(now.getTime() + duration * 60_000);
      endTimeToUse = newEnd;
      const docRef = doc(db, LISTINGS_COLLECTION, id);
      batch.update(docRef, { endTime: Timestamp.fromDate(newEnd) });
      hasWrites = true;
    }

    items.push(docToItem(id, data, endTimeToUse));
  }

  if (hasWrites) {
    await batch.commit();
  }

  return items;
}

/**
 * Fetch a single listing by id. Resets endTime for fake listings if needed.
 */
export async function fetchListingById(id: string): Promise<Item | null> {
  const db = getDb();
  if (!db) return null;

  const ref = doc(db, LISTINGS_COLLECTION, id);
  const docSnap = await getDoc(ref);

  if (!docSnap.exists()) return null;

  const data = docSnap.data() as ListingDoc;
  const endTime = data.endTime?.toDate?.() ?? new Date(0);
  const isFake = data.isFakeListing === true;
  const duration =
    data.fakeListingDurationMinutes ?? DEFAULT_FAKE_LISTING_DURATION_MINUTES;
  const now = new Date();

  let endTimeToUse = endTime;
  if (isFake && endTime <= now) {
    const newEnd = new Date(now.getTime() + duration * 60_000);
    endTimeToUse = newEnd;
    const batch = writeBatch(db);
    batch.update(ref, { endTime: Timestamp.fromDate(newEnd) });
    await batch.commit();
  }

  return docToItem(id, data, endTimeToUse);
}
