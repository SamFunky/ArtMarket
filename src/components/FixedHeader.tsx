"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const FADE_DURATION_MS = 300;

export default function FixedHeader() {
  const [heroInView, setHeroInView] = useState(true);
  const [fixedOpacity, setFixedOpacity] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [fadeOutOpacity, setFadeOutOpacity] = useState(1);
  const pathname = usePathname();

  const showHeader = pathname !== "/" || !heroInView;

  useEffect(() => {
    if (pathname !== "/") {
      setHeroInView(false);
      return;
    }

    const handleScroll = () => {
      setHeroInView(window.scrollY < window.innerHeight * 0.6);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Fade in when header should appear
  useEffect(() => {
    if (showHeader && !fadingOut) {
      setFixedOpacity(0);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setFixedOpacity(1));
      });
      return () => cancelAnimationFrame(id);
    } else if (!showHeader) {
      setFixedOpacity(0);
    }
  }, [showHeader, fadingOut]);

  const prevShowHeader = useRef(showHeader);

  // Fade out when scrolling back to hero
  useEffect(() => {
    if (!showHeader && prevShowHeader.current) {
      setFadingOut(true);
      setFadeOutOpacity(1);
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => setFadeOutOpacity(0));
      });
      const timeoutId = setTimeout(() => setFadingOut(false), FADE_DURATION_MS);
      prevShowHeader.current = showHeader;
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timeoutId);
      };
    }
    prevShowHeader.current = showHeader;
  }, [showHeader]);

  const renderHeader = showHeader || fadingOut;
  const opacity = renderHeader
    ? fadingOut
      ? fadeOutOpacity
      : fixedOpacity
    : 0;

  if (!renderHeader) return null;

  return (
    <header
      className="fixed left-1/2 top-4 z-50 w-[calc(100%-1rem)] -translate-x-1/2"
      style={{
        opacity: pathname !== "/" ? 1 : opacity,
        transition: `opacity ${FADE_DURATION_MS}ms ease`,
      }}
    >
      <nav
        className="flex items-center justify-between rounded-full bg-white px-6 py-4 sm:px-8"
        style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.08)" }}
      >
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl"
        >
          Curator
        </Link>
        <div className="flex items-center gap-6 sm:gap-8">
          <Link
            href="/explore"
            className="text-sm text-zinc-700 transition-colors hover:text-zinc-900 sm:text-base"
          >
            Explore
          </Link>
          <Link
            href="/signin"
            className="text-sm text-zinc-700 transition-colors hover:text-zinc-900 sm:text-base"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:bg-zinc-800 sm:px-5"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}
