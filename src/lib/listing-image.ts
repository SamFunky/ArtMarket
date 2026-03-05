export function getListingImageSrc(url: string): string {
  if (url.startsWith("https://nrs.harvard.edu/") && !url.includes("?")) {
    return `${url}?width=800&height=800`;
  }
  return url;
}
