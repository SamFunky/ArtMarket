import type { ArtEra, ArtType } from "@/data/items";

const BASE = "https://api.harvardartmuseums.org";

export type HarvardObjectRecord = {
  objectid: number;
  title?: string | null;
  objectnumber?: string | null;
  primaryimageurl?: string | null;
  classification?: string | null;
  classificationid?: number | null;
  dated?: string | null;
  datebegin?: number | null;
  dateend?: number | null;
  century?: string | null;
  culture?: string | null;
  medium?: string | null;
  worktype?: string | null;
  imagecount?: number;
};

export type HarvardObjectResponse = {
  info: { totalrecords: number; page: number; pages: number; next?: string };
  records: HarvardObjectRecord[];
};

export async function fetchHarvardObjects(
  apiKey: string,
  options: { size?: number; page?: number; hasimage?: number; sort?: string } = {}
): Promise<HarvardObjectResponse> {
  const params = new URLSearchParams({
    apikey: apiKey,
    size: String(options.size ?? 100),
    page: String(options.page ?? 1),
    ...(options.hasimage !== undefined && { hasimage: String(options.hasimage) }),
  });
  if (options.sort) {
    params.set("sort", options.sort);
  }
  const url = `${BASE}/object?${params}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Harvard Art API error ${res.status}: ${t}`);
  }
  return res.json() as Promise<HarvardObjectResponse>;
}

const ID_CHUNK_SIZE = 50;

export async function fetchHarvardObjectsByIds(
  apiKey: string,
  ids: number[]
): Promise<HarvardObjectRecord[]> {
  const allRecords: HarvardObjectRecord[] = [];

  for (let i = 0; i < ids.length; i += ID_CHUNK_SIZE) {
    const chunk = ids.slice(i, i + ID_CHUNK_SIZE);
    const idParam = chunk.join("|");
    const params = new URLSearchParams({ apikey: apiKey, id: idParam });
    const url = `${BASE}/object?${params}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Harvard Art API error ${res.status}: ${t}`);
    }
    const data = (await res.json()) as HarvardObjectResponse;
    allRecords.push(...(data.records ?? []));
  }

  return allRecords;
}

function mapClassificationToArtType(classification: string | null | undefined): ArtType {
  if (!classification) return "mixed media";
  const c = classification.toLowerCase();
  if (c.includes("painting") && !c.includes("watercolor")) return "oil painting";
  if (c.includes("watercolor")) return "watercolor";
  if (c.includes("sculpture") || c.includes("statue")) return "sculpture";
  if (c.includes("ceramic") || c.includes("vessel") || c.includes("pottery")) return "ceramic";
  if (c.includes("drawing") || c.includes("print")) return "drawing";
  return "mixed media";
}

function mapDateToEra(
  datebegin?: number | null,
  dateend?: number | null,
  dated?: string | null
): ArtEra {
  const year = dateend ?? datebegin ?? 0;
  if (year < 500) return "ancient";
  if (year < 1400) return "classical";
  if (year < 1600) return "renaissance";
  if (year < 1800) return "baroque";
  if (year < 1940) return "modern";
  return "contemporary";
}

function categoryFromArtType(artType: ArtType): "painting" | "sculpture" | "artifact" {
  if (artType === "sculpture") return "sculpture";
  if (["oil painting", "watercolor", "drawing"].includes(artType)) return "painting";
  return "artifact";
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomBid(): number {
  const r = Math.random();
  if (r < 0.6) {
    return randInt(500, 5_000);
  }
  if (r < 0.9) {
    return randInt(5_000, 25_000);
  }
  if (r < 0.99) {
    return randInt(25_000, 50_000);
  }
  return randInt(50_000, 250_000);
}

function randomTimeLeftMinutes(): number {
  const oneHour = 60;
  const oneDay = 60 * 24;
  const maxMinutes = oneDay * 30;
  const r = Math.random();

  if (r < 0.5) {
    return randInt(oneHour, oneDay);
  }
  if (r < 0.85) {
    return randInt(oneDay, oneDay * 7);
  }
  if (r < 0.99) {
    return randInt(oneDay * 7, oneDay * 21);
  }
  return randInt(oneDay * 21, maxMinutes);
}

export type MappedHarvardListing = {
  id: string;
  title: string;
  category: "painting" | "sculpture" | "artifact";
  currentBid: number;
  endTimeMinutesFromNow: number;
  era: ArtEra;
  artType: ArtType;
  image?: string;
};

export function mapHarvardRecordToListing(record: HarvardObjectRecord): MappedHarvardListing | null {
  const title = record.title?.trim() || record.objectnumber?.trim();
  if (!title) return null;
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.startsWith("untitled")) return null;
  if (lowerTitle.startsWith("coin")) return null;
  if (!record.primaryimageurl?.trim()) return null;

  const artType = mapClassificationToArtType(record.classification);
  const era = mapDateToEra(record.datebegin, record.dateend, record.dated);
  const category = categoryFromArtType(artType);

  return {
    id: `harvard-${record.objectid}`,
    title: title.slice(0, 200),
    category,
    currentBid: randomBid(),
    endTimeMinutesFromNow: randomTimeLeftMinutes(),
    era,
    artType,
    image: record.primaryimageurl.trim(),
  };
}
