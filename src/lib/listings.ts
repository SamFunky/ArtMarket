import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
  writeBatch,
  type Timestamp as FSTimestamp,
  type WriteBatch,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type { ArtEra, ArtType, Item } from "@/data/items";

export const LISTINGS_COLLECTION = "listings";

export const DEFAULT_FAKE_LISTING_DURATION_MINUTES = 60 * 12;

export type ListingDoc = {
  title: string;
  category: "painting" | "sculpture" | "artifact";
  currentBid: number;
  endTime: FSTimestamp;
  era: ArtEra;
  artType: ArtType;
  isFakeListing?: boolean;
  fakeListingDurationMinutes?: number;
  image?: string;
  imagePosition?: string;
  imageFit?: "cover" | "contain";
  model?: boolean;
  modelSrc?: string;
  modelScale?: number;
  modelRotation?: [number, number, number];
  modelPosition?: [number, number, number];
  description?: string;
  dateRange?: string;
  creatorId?: string;
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
    description: data.description,
    dateRange: data.dateRange,
  };
}

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

export const LISTING_DURATION_DAYS = [1, 7, 14, 40] as const;
export type ListingDurationDays = (typeof LISTING_DURATION_DAYS)[number];

export type CreateListingInput = {
  title: string;
  category: "painting" | "sculpture" | "artifact";
  currentBid: number;
  era: ListingDoc["era"];
  artType: ListingDoc["artType"];
  durationDays: ListingDurationDays;
  creatorId: string;
  description?: string;
  dateRange?: string;
  image?: string;
};

function minutesFromDays(days: number): number {
  return days * 24 * 60;
}

export async function createListing(input: CreateListingInput): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");

  const durationMinutes = minutesFromDays(input.durationDays);
  const now = new Date();
  const endTime = new Date(now.getTime() + durationMinutes * 60_000);

  const docRef = await addDoc(collection(db, LISTINGS_COLLECTION), {
    title: input.title.trim(),
    category: input.category,
    currentBid: Number(input.currentBid) || 0,
    endTime: Timestamp.fromDate(endTime),
    era: input.era,
    artType: input.artType,
    creatorId: input.creatorId,
    isFakeListing: true,
    fakeListingDurationMinutes: durationMinutes,
    ...(input.description?.trim() && { description: input.description.trim() }),
    ...(input.dateRange?.trim() && { dateRange: input.dateRange.trim() }),
    ...(input.image?.trim() && { image: input.image.trim() }),
  });

  return docRef.id;
}

export async function fetchListingsByCreator(creatorId: string): Promise<Item[]> {
  const db = getDb();
  if (!db) return [];

  const colRef = collection(db, LISTINGS_COLLECTION);
  const q = query(colRef, where("creatorId", "==", creatorId));
  const snap = await getDocs(q);

  const now = new Date();
  const batch = writeBatch(db);
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
