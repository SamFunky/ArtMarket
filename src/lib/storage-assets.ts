const BUCKET = "curatorartmarket.firebasestorage.app";
const BASE = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o`;

function storageUrl(path: string): string {
  return `${BASE}/${encodeURIComponent(path)}?alt=media`;
}

export const STORAGE_ASSETS = {
  heroImage: storageUrl("Maecenas Presenting the Liberal Arts to the Emperor Augustus.jpg"),
  theApparition: storageUrl("TheApparition.jpg"),
} as const;
