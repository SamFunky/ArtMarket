"use client";

import Link from "next/link";
import LotCard from "@/components/LotCard";
import Reveal from "@/components/Reveal";
import { useListings } from "@/hooks/useListings";

export default function TrendingEndingSoon() {
  const { items } = useListings();
  const endingSoon = [...items]
    .filter((item) => Boolean(item.image))
    .sort((a, b) => a.timeLeftMinutes - b.timeLeftMinutes)
    .slice(0, 12);

  if (endingSoon.length === 0) return null;

  return (
    <section className="w-full bg-paper px-5 py-20 sm:px-10 sm:py-28 lg:px-14">
      <div className="mx-auto max-w-[110rem]">
        <Reveal className="mb-12 flex items-end justify-between gap-6 border-b border-line pb-6">
          <div>
            <p className="label-caps flex items-center gap-2 text-oxblood">
              <span className="h-2 w-2 animate-pulse rounded-full bg-oxblood" aria-hidden />
              03 — The final hours
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Ending soon
            </h2>
          </div>
          <Link
            href="/explore"
            className="link-underline label-caps hidden shrink-0 pb-2 text-ink sm:block"
          >
            View all
          </Link>
        </Reveal>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {endingSoon.map((item, i) => (
            <Reveal key={item.id} delay={(i % 6) * 70}>
              <LotCard item={item} />
            </Reveal>
          ))}
        </div>
        <Link
          href="/explore"
          className="link-underline label-caps mt-10 block text-center text-ink sm:hidden"
        >
          View all
        </Link>
      </div>
    </section>
  );
}
