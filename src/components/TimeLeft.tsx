"use client";

import { useEffect, useRef, useState } from "react";
import type { Item } from "@/data/items";

function secondsOffset(id: string): number {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) % 60;
  return Math.abs(n);
}

function getParts(remainingMs: number): { d: number; h: number; m: number; s: number } {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const d = Math.floor(totalSeconds / (24 * 3600));
  const h = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { d, h, m, s };
}

function formatParts(parts: { d: number; h: number; m: number; s: number }): string {
  const { d, h, m, s } = parts;
  if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getEndTimeMs(item: Item): number {
  if (item.endTimeMs != null) return item.endTimeMs;
  const offsetMs = secondsOffset(item.id) * 1000;
  return Date.now() + item.timeLeftMinutes * 60_000 + offsetMs;
}

export default function TimeLeft({ item }: { item: Item }) {
  const [mounted, setMounted] = useState(false);
  const endTimeMs = getEndTimeMs(item);
  const endTimeMsRef = useRef(endTimeMs);
  endTimeMsRef.current = endTimeMs;
  const [parts, setParts] = useState(() => getParts(endTimeMs - Date.now()));

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const tick = () => setParts(getParts(endTimeMsRef.current - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [mounted, item.id]);

  if (!mounted) {
    return <span suppressHydrationWarning>--</span>;
  }

  if (item.auctionEnded === true) return <>ENDED</>;
  const remainingMs = endTimeMsRef.current - Date.now();
  if (remainingMs <= 0) return <>ENDED</>;

  return <span suppressHydrationWarning>{formatParts(parts)}</span>;
}
