import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  Timestamp,
  where,
  type Timestamp as FSTimestamp,
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
  highestBidderId?: string;
  highestBidderEmail?: string;
  finalized?: boolean;
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
    creatorId: data.creatorId,
    highestBidderId: data.highestBidderId,
    highestBidderEmail: data.highestBidderEmail,
    auctionEnded: data.finalized === true,
    isFakeListing: data.isFakeListing === true,
  };
}

export async function fetchListings(): Promise<Item[]> {
  const [firestoreItems, localFakes] = await Promise.all([
    fetchAllFirestoreListings(),
    fetchLocalFakes(),
  ]);
  const firestoreFakeById = new Map(
    firestoreItems.filter((i) => i.isFakeListing).map((i) => [i.id, i])
  );
  const firestoreReal = firestoreItems.filter((i) => !i.isFakeListing);
  const mergedFakes = localFakes.map((lf) => firestoreFakeById.get(lf.id) ?? lf);
  const all = [...mergedFakes, ...firestoreReal];
  return all.filter(
    (i) => !i.auctionEnded && (i.timeLeftMinutes ?? 0) > 0
  );
}

async function fetchLocalFakes(): Promise<Item[]> {
  try {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const res = await fetch(`${base}/api/listings/local-fakes`);
    if (!res.ok) return [];
    return (await res.json()) as Item[];
  } catch {
    return [];
  }
}

async function fetchAllFirestoreListings(): Promise<Item[]> {
  const db = getDb();
  if (!db) return [];

  const colRef = collection(db, LISTINGS_COLLECTION);
  const snap = await getDocs(colRef);

  const items: Item[] = [];
  for (const docSnap of snap.docs) {
    const id = docSnap.id;
    const data = docSnap.data() as ListingDoc;
    const endTime = data.endTime?.toDate?.() ?? new Date(0);
    const finalized = data.finalized === true;
    const now = new Date();
    if (finalized || endTime <= now) continue;
    items.push(docToItem(id, data, endTime));
  }
  return items;
}

export async function fetchListingById(id: string): Promise<Item | null> {
  const db = getDb();
  if (db) {
    const ref = doc(db, LISTINGS_COLLECTION, id);
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      const data = docSnap.data() as ListingDoc;
      const endTime = data.endTime?.toDate?.() ?? new Date(0);
      return docToItem(id, data, endTime);
    }
  }

  try {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const res = await fetch(`${base}/api/listings/local-fakes?id=${encodeURIComponent(id)}`);
    if (res.ok) {
      return (await res.json()) as Item;
    }
  } catch {
  }
  return null;
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
    isFakeListing: false,
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

  const items: Item[] = [];
  for (const docSnap of snap.docs) {
    const id = docSnap.id;
    const data = docSnap.data() as ListingDoc;
    const endTime = data.endTime?.toDate?.() ?? new Date(0);
    items.push(docToItem(id, data, endTime));
  }
  return items;
}

export async function deleteListing(listingId: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");

  const ref = doc(db, LISTINGS_COLLECTION, listingId);
  await deleteDoc(ref);
}
