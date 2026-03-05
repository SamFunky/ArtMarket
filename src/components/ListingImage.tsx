"use client";

import Image from "next/image";
import { useState } from "react";
import { getListingImageSrc } from "@/lib/listing-image";
import type { Item } from "@/data/items";

type ListingImageProps = {
  item: Item;
  className?: string;
  fill?: boolean;
  sizes?: string;
};

export function ListingImage({ item, className, fill, sizes }: ListingImageProps) {
  const [externalError, setExternalError] = useState(false);

  if (!item.image) return null;

  const isExternal = item.image.startsWith("http");

  if (isExternal) {
    if (externalError) {
      return (
        <div
          className={className}
          style={fill ? { position: "absolute", inset: 0 } : undefined}
          aria-hidden
        >
          <div className="flex h-full w-full items-center justify-center bg-zinc-200/80">
            <span className="text-xs text-zinc-500">{item.artType}</span>
          </div>
        </div>
      );
    }
    return (
      <img
        src={getListingImageSrc(item.image)}
        alt={item.title}
        className={className}
        style={fill ? { position: "absolute", inset: 0, height: "100%", width: "100%" } : undefined}
        referrerPolicy="no-referrer"
        onError={() => setExternalError(true)}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={item.image}
        alt={item.title}
        fill
        className={className}
        sizes={sizes}
      />
    );
  }

  return (
    <Image
      src={item.image}
      alt={item.title}
      width={1200}
      height={900}
      className={className}
      sizes={sizes}
    />
  );
}
