"use client";

import Image from "next/image";
import Link from "next/link";
import { STORAGE_ASSETS } from "@/lib/storage-assets";
import { useEffect, useState } from "react";

const PARALLAX_FACTOR = 0.2;

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleImageLoad() {
    setFadeOut(true);
    setTimeout(() => setImageLoaded(true), 400);
  }

  return (
    <>
      {!imageLoaded && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink transition-opacity duration-400"
          style={{ opacity: fadeOut ? 0 : 1 }}
          aria-hidden
        >
          <div className="flex flex-col items-center gap-6">
            <span className="font-display text-3xl italic text-paper/90">
              Curator<span className="text-gilt">.</span>
            </span>
            <div className="h-px w-24 overflow-hidden bg-white/15">
              <div className="h-full w-1/2 animate-[hero-load_1.2s_ease-in-out_infinite] bg-gilt" />
            </div>
          </div>
          <style>{`@keyframes hero-load { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
        </div>
      )}
      <section className="relative flex min-h-[92vh] w-screen shrink-0 flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-[100vh] bg-ink sm:h-[150vh] sm:min-h-[150vh]"
          style={{
            transform: `translate3d(0, ${-scrollY * PARALLAX_FACTOR}px, 0)`,
          }}
        >
          <Image
            src={STORAGE_ASSETS.heroImage}
            alt=""
            fill
            unoptimized
            className="object-cover object-left-top sm:object-center"
            priority
            onLoad={handleImageLoad}
          />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/30"
          aria-hidden
        />

        {/* Type composition */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pt-32 text-center sm:px-10">
          <p className="label-caps text-paper/70">
            Est. MMXXVI · A living auction house
          </p>
          <h1 className="mt-6 font-display text-[clamp(3.25rem,11vw,10.5rem)] font-medium leading-[0.98] tracking-tight text-paper">
            The <span className="italic font-light text-gilt">Curator</span>
          </h1>
          <p className="mt-8 max-w-xl text-balance text-base leading-relaxed text-paper/80 sm:text-lg">
            Fine art, antiquities, and objects of consequence — offered live,
            sold to the patient hand.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/explore"
              className="group label-caps inline-flex items-center gap-3 bg-paper px-8 py-4 text-ink transition-colors duration-300 hover:bg-gilt hover:text-ink"
            >
              Enter the saleroom
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
              >
                →
              </span>
            </Link>
            <Link
              href="/signup"
              className="link-underline label-caps text-paper/80 transition-colors hover:text-paper"
            >
              Register to bid
            </Link>
          </div>
        </div>

        {/* Bottom ledger strip */}
        <div className="relative z-10 border-t border-white/15 bg-ink/40 backdrop-blur-sm">
          <div className="mx-auto grid max-w-[110rem] grid-cols-1 divide-y divide-white/10 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-10">
            {[
              ["Now showing", "Featured lots, live bidding"],
              ["Provenance first", "Every lot researched & documented"],
              ["Worldwide", "Insured shipping on all sales"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 py-5 sm:px-8 sm:first:pl-0">
                <span className="label-caps text-gilt">{k}</span>
                <span className="text-sm text-paper/75">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
