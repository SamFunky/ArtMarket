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
  { id: "1", title: "The Apparition", category: "painting", currentBid: 12400, timeLeftMinutes: 154, era: "modern", artType: "oil painting", image: STORAGE_ASSETS.theApparition, imageFit: "contain" },
  { id: "2", title: "Old Roman Coin", category: "painting", currentBid: 24100, timeLeftMinutes: 68, era: "ancient", artType: "mixed media", model: true, modelSrc: "/models/old_roman_coin_ueinbaiva_mid.glb", modelScale: 80, modelRotation: [Math.PI / 2, 0, 0] },
  { id: "3", title: "Oriental Vase", category: "painting", currentBid: 8750, timeLeftMinutes: 312, era: "classical", artType: "ceramic", model: true, modelSrc: "/models/oriental_vase.glb", modelScale: 3, modelPosition: [0, -1.3, 0] },
  { id: "4", title: "Maecenas Presenting the Liberal Arts", category: "painting", currentBid: 18750, timeLeftMinutes: 420, era: "renaissance", artType: "oil painting" },
  { id: "5", title: "Statue of Buddha", category: "painting", currentBid: 32500, timeLeftMinutes: 95, era: "ancient", artType: "sculpture" },
  { id: "6", title: "Celestial Muse", category: "painting", currentBid: 5600, timeLeftMinutes: 720, era: "baroque", artType: "oil painting" },
  { id: "7", title: "Antique Ming Dynasty Vase", category: "painting", currentBid: 42800, timeLeftMinutes: 45, era: "classical", artType: "ceramic" },
  { id: "8", title: "Augustus and the Liberal Arts", category: "painting", currentBid: 22100, timeLeftMinutes: 189, era: "renaissance", artType: "oil painting" },
  { id: "9", title: "Roman Denarius, Caesar Era", category: "painting", currentBid: 12800, timeLeftMinutes: 520, era: "ancient", artType: "mixed media" },
  { id: "10", title: "Seated Buddha", category: "painting", currentBid: 38900, timeLeftMinutes: 210, era: "ancient", artType: "sculpture" },
  { id: "11", title: "Vision of the Divine", category: "painting", currentBid: 15200, timeLeftMinutes: 92, era: "contemporary", artType: "mixed media" },
  { id: "12", title: "Blue and White Porcelain Vase", category: "painting", currentBid: 9750, timeLeftMinutes: 380, era: "classical", artType: "ceramic" },
  { id: "13", title: "Imperial Court Scene", category: "painting", currentBid: 28400, timeLeftMinutes: 610, era: "baroque", artType: "oil painting" },
  { id: "14", title: "Ancient Roman Sestertius", category: "painting", currentBid: 6700, timeLeftMinutes: 155, era: "ancient", artType: "mixed media" },
  { id: "15", title: "Meditating Buddha", category: "painting", currentBid: 41200, timeLeftMinutes: 330, era: "ancient", artType: "sculpture" },
  { id: "16", title: "Ethereal Figure Study", category: "painting", currentBid: 8900, timeLeftMinutes: 480, era: "contemporary", artType: "watercolor" },
  { id: "17", title: "Japanese Imari Vase", category: "painting", currentBid: 19500, timeLeftMinutes: 72, era: "classical", artType: "ceramic" },
  { id: "18", title: "Renaissance Masterwork", category: "painting", currentBid: 35700, timeLeftMinutes: 245, era: "renaissance", artType: "oil painting" },
  { id: "19", title: "Bronze Age Roman Coin", category: "painting", currentBid: 11200, timeLeftMinutes: 890, era: "ancient", artType: "mixed media" },
  { id: "20", title: "Enlightened One", category: "painting", currentBid: 46800, timeLeftMinutes: 125, era: "ancient", artType: "sculpture" },
];
