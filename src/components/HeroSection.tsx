"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import HeroHeader from "./HeroHeader";

const PARALLAX_FACTOR = 0.2;

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative flex min-h-[60vh] w-screen shrink-0 items-center justify-center overflow-hidden px-8 sm:px-12 lg:px-16">
      <HeroHeader />
      <div
        className="absolute inset-x-0 top-0 h-[150vh] min-h-[150vh]"
        style={{
          transform: `translate3d(0, ${-scrollY * PARALLAX_FACTOR}px, 0)`,
        }}
      >
        <Image
          src="/artwork/Maecenas Presenting the Liberal Arts to the Emperor Augustus.jpg"
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: "center 600%" }}
          priority
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"
        aria-hidden
      />
      <div className="relative z-10 flex w-full flex-col items-start gap-20">
        <div className="flex w-full justify-center">
          <div className="inline-flex flex-col items-center -space-y-8">
          <div className="relative">
            <span className="absolute left-1/2 -top-5 -translate-x-1/2 font-display text-2xl text-[#f5e6dc] sm:text-4xl lg:text-5xl scale-y-65">
              THE
            </span>
            <h1 className="font-display text-8xl font-bold tracking-tight text-[#f5e6dc] sm:text-9xl lg:text-[12rem]">
              CURATOR
            </h1>
          </div>
          <p className="text-center text-3xl text-[#ecd5cc] sm:text-4xl lg:text-5xl scale-y-65">
            Fine Art Marketplace
          </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 -mb-50">
          <span className="text-sm font-medium uppercase tracking-widest text-white/70">
            Featured Highlight
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Live Auction Now
          </h2>
          <Link
            href="/explore"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f5e6dc] px-6 py-3 font-medium text-zinc-900 transition-colors hover:bg-[#ecd5cc]"
          >
            View All Auctions
            <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
