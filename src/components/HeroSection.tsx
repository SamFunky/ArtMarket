"use client";

import Image from "next/image";
import Link from "next/link";
import { STORAGE_ASSETS } from "@/lib/storage-assets";
import { useEffect, useState } from "react";

const PARALLAX_FACTOR = 0.2;

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative flex min-h-[60vh] w-screen shrink-0 items-center justify-center overflow-hidden px-4 sm:px-8 md:px-12 lg:px-16">
      <div
        className="absolute inset-x-0 top-0 h-[100vh] bg-zinc-900 sm:h-[150vh] sm:min-h-[150vh]"
        style={{
          transform: `translate3d(0, ${-scrollY * PARALLAX_FACTOR}px, 0)`,
        }}
      >
        <Image
          src={STORAGE_ASSETS.heroImage}
          alt=""
          fill
          className="object-cover object-left-top sm:object-[center_600%]"
          priority
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"
        aria-hidden
      />
      <div className="relative z-10 flex w-full flex-col items-start gap-10 sm:gap-16 lg:gap-20">
        <div className="flex w-full justify-center">
          <div className="inline-flex flex-col items-center -space-y-4 sm:-space-y-6 lg:-space-y-8">
            <div className="relative">
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 sm:-top-4 lg:-top-5 font-display text-sm sm:text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl text-[#faf5f2] scale-y-65">
                THE
              </span>
              <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl 2xl:text-[12rem] font-bold tracking-tight text-[#faf5f2]">
                CURATOR
              </h1>
            </div>
            <p className="text-center text-lg sm:text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl text-[#f0e6e0] scale-y-65">
              Fine Art Marketplace
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:gap-4 -mb-10 sm:-mb-20 lg:-mb-50">
          <span className="text-xs sm:text-sm font-medium uppercase tracking-widest text-white/70">
            Featured Highlight
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Live Auction Now
          </h2>
          <Link
            href="/explore"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#faf5f2] px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-medium text-[rgb(30,36,44)] transition-colors hover:bg-[#f0e6e0]"
          >
            View All Auctions
            <span className="text-base sm:text-lg">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
