"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { STORAGE_ASSETS } from "@/lib/storage-assets";
import ModelViewer from "@/components/ModelViewer";
import Reveal from "@/components/Reveal";
import TimeLeft from "@/components/TimeLeft";
import { fetchListingById } from "@/lib/listings";
import type { Item } from "@/data/items";

type AuctionConfig = {
  id: string;
  title: string;
  medium: string;
  image?: string;
  imageFit?: "cover" | "contain";
  model?: boolean;
  modelSrc?: string;
  modelScale?: number;
  modelRotation?: [number, number, number];
  modelPosition?: [number, number, number];
};

const AUCTION_CONFIGS: AuctionConfig[] = [
  {
    id: "1",
    title: "The Apparition",
    medium: "Oil on canvas · Modern",
    image: STORAGE_ASSETS.theApparition,
    imageFit: "contain",
  },
  {
    id: "2",
    title: "Old Roman Coin",
    medium: "Struck bronze · Ancient",
    model: true,
    modelSrc: "/models/old_roman_coin_ueinbaiva_mid.glb",
    modelScale: 80,
    modelRotation: [Math.PI / 2, 0, 0],
  },
  {
    id: "3",
    title: "Oriental Vase",
    medium: "Glazed ceramic · Classical",
    model: true,
    modelSrc: "/models/oriental_vase.glb",
    modelScale: 3,
    modelPosition: [0, -1.3, 0],
  },
];

function formatBid(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function useFeaturedItem(id: string): Item | null {
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    fetchListingById(id).then((result) => {
      if (result) setItem(result);
    });
  }, [id]);

  return item;
}

function FeaturedCard({ config, index }: { config: AuctionConfig; index: number }) {
  const liveItem = useFeaturedItem(config.id);
  const lotNumber = `Lot ${String(index + 1).padStart(3, "0")}`;

  return (
    <Reveal delay={index * 120} className="group flex flex-col">
      <Link href={`/item/${config.id}`} className="block">
        <div className="frame-mat overflow-hidden">
          <div className="overflow-hidden">
            {config.model ? (
              <ModelViewer
                src={config.modelSrc!}
                scale={config.modelScale ?? 1}
                baseRotation={config.modelRotation}
                modelPosition={config.modelPosition}
              />
            ) : (
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={config.image!}
                  alt={config.title}
                  fill
                  unoptimized
                  className={`img-zoom ${
                    config.imageFit === "contain" ? "object-contain" : "object-cover"
                  }`}
                />
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="label-caps text-bronze">{lotNumber}</span>
          <span className="label-caps text-ink-mute">{config.medium}</span>
        </div>
        <Link href={`/item/${config.id}`} className="mt-2 block">
          <h3 className="font-display text-2xl leading-tight text-ink transition-colors group-hover:text-bronze sm:text-3xl">
            {config.title}
          </h3>
        </Link>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-line pt-4">
          <div>
            <p className="label-caps text-ink-mute">Current bid</p>
            <p className="mt-1 font-display text-2xl tabular-nums text-ink">
              {liveItem ? (
                formatBid(liveItem.currentBid)
              ) : (
                <span className="inline-block h-7 w-24 animate-pulse rounded-sm bg-paper-deep" />
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="label-caps text-ink-mute">Closes in</p>
            <p className="mt-1 text-sm font-medium tabular-nums text-ink">
              {liveItem ? (
                <TimeLeft item={liveItem} />
              ) : (
                <span className="inline-block h-5 w-16 animate-pulse rounded-sm bg-paper-deep" />
              )}
            </p>
          </div>
        </div>

        <Link
          href={`/item/${config.id}`}
          className="label-caps mt-5 inline-flex w-full items-center justify-between border border-ink/20 px-6 py-4 text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-paper"
        >
          Place a bid
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </Reveal>
  );
}

export default function FeaturedAuctions() {
  return (
    <section className="relative w-full bg-paper px-5 py-20 sm:px-10 sm:py-28 lg:px-14">
      <div className="mx-auto w-full max-w-[110rem]">
        <Reveal className="mb-12 flex items-end justify-between gap-6 border-b border-line pb-6 sm:mb-16">
          <div>
            <p className="label-caps text-bronze">01 — This week&apos;s sale</p>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Featured lots
            </h2>
          </div>
          <Link
            href="/explore"
            className="link-underline label-caps hidden shrink-0 pb-2 text-ink sm:block"
          >
            View the catalogue
          </Link>
        </Reveal>
        <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-3">
          {AUCTION_CONFIGS.map((config, i) => (
            <FeaturedCard key={config.id} config={config} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
