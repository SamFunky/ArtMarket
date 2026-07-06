import { STORAGE_ASSETS } from "@/lib/storage-assets";

export type ArtEra = "ancient" | "renaissance" | "baroque" | "modern" | "contemporary" | "classical";
export type ArtType = "oil painting" | "sculpture" | "ceramic" | "watercolor" | "mixed media" | "drawing";

export type Item = {
  id: string;
  title: string;
  category: "painting" | "sculpture" | "artifact";
  currentBid: number;
  timeLeftMinutes: number;
  endTimeMs?: number;
  era: ArtEra;
  artType: ArtType;
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
  auctionEnded?: boolean;
  isFakeListing?: boolean;
};

const FAKE_LISTING_CYCLE_MS = 12 * 60 * 60 * 1000;

export function getLocalFakeListings(): Item[] {
  const now = Date.now();
  const cycleStart = Math.floor(now / FAKE_LISTING_CYCLE_MS) * FAKE_LISTING_CYCLE_MS;

  return allItems.map((item) => {
    const phaseMs = ((parseInt(item.id, 10) || item.id.charCodeAt(0)) % 720) * 60 * 1000;
    let endTimeMs = cycleStart + phaseMs;
    if (endTimeMs <= now) endTimeMs += FAKE_LISTING_CYCLE_MS;
    const timeLeftMinutes = Math.max(0, Math.floor((endTimeMs - now) / 60_000));
    return {
      ...item,
      timeLeftMinutes,
      endTimeMs,
      isFakeListing: true,
    };
  });
}

export const allItems: Item[] = [
  { id: "1", title: "The Apparition", category: "painting", currentBid: 112400, timeLeftMinutes: 112400, era: "modern", artType: "oil painting", image: STORAGE_ASSETS.theApparition, imageFit: "contain" },
  { id: "2", title: "Old Roman Coin", category: "painting", currentBid: 78410, timeLeftMinutes: 224100, era: "ancient", artType: "mixed media", model: true, modelSrc: "/models/old_roman_coin_ueinbaiva_mid.glb", modelScale: 80, modelRotation: [Math.PI / 2, 0, 0] },
  { id: "3", title: "Oriental Vase", category: "painting", currentBid: 56750, timeLeftMinutes: 28750, era: "classical", artType: "ceramic", model: true, modelSrc: "/models/oriental_vase.glb", modelScale: 3, modelPosition: [0, -1.3, 0] },
];
