"use client";

import Image from "next/image";
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
    <section className="relative flex min-h-screen w-screen shrink-0 items-center overflow-hidden pl-8 sm:pl-12 lg:pl-16">
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
          className="-scale-x-100 object-cover object-center"
          priority
        />
      </div>
      <div
        className="absolute inset-0 bg-black/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/30 to-transparent"
        aria-hidden
      />
      <div className="relative z-10 inline-flex w-fit flex-col -space-y-8">
        <div className="relative">
          <span className="absolute left-10 -top-5 font-display text-2xl text-[#f5e6dc] sm:text-4xl lg:text-5xl scale-y-65">
            THE
          </span>
          <h1 className="font-display text-8xl font-bold tracking-tight text-[#f5e6dc] sm:text-9xl lg:text-[12rem]">
            CURATOR
          </h1>
        </div>
        <p className="-translate-x-10 text-right text-3xl text-[#ecd5cc] sm:text-4xl lg:text-5xl scale-y-65">
          Fine Art Marketplace
        </p>
      </div>
    </section>
  );
}
