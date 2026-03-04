"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PRICE_MIN = 0;
const PRICE_MAX = 50000;
const STEP = 500;

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

type Props = {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
};

export default function PriceRangeSlider({ min, max, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeThumb, setActiveThumb] = useState<"min" | "max" | null>(null);

  const valueToPercent = useCallback((v: number) => {
    return ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  }, []);

  const percentToValue = useCallback((p: number) => {
    const raw = PRICE_MIN + (p / 100) * (PRICE_MAX - PRICE_MIN);
    return Math.round(raw / STEP) * STEP;
  }, []);

  const updateFromEvent = useCallback(
    (e: React.MouseEvent | MouseEvent, thumb: "min" | "max") => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const value = percentToValue(x * 100);

      if (thumb === "min") {
        const newMin = Math.min(value, max - STEP);
        onChange(Math.max(PRICE_MIN, newMin), max);
      } else {
        const newMax = Math.max(value, min + STEP);
        onChange(min, Math.min(PRICE_MAX, newMax));
      }
    },
    [min, max, onChange, percentToValue]
  );

  const handleThumbMouseDown = useCallback((thumb: "min" | "max") => {
    setActiveThumb(thumb);
  }, []);

  useEffect(() => {
    if (!activeThumb) return;
    const handleMove = (e: MouseEvent) => updateFromEvent(e, activeThumb);
    const handleUp = () => setActiveThumb(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [activeThumb, updateFromEvent]);

  const minPercent = valueToPercent(min);
  const maxPercent = valueToPercent(max);

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-zinc-500">
        {formatPrice(min)} – {formatPrice(max)}
      </p>
      <div
        ref={trackRef}
        className="relative h-2 w-full rounded-full bg-zinc-200/80"
        onMouseDown={(e) => {
          const rect = trackRef.current?.getBoundingClientRect();
          if (!rect) return;
          const x = (e.clientX - rect.left) / rect.width;
          const mid = (minPercent + maxPercent) / 2 / 100;
          const thumb = x < mid ? "min" : "max";
          handleThumbMouseDown(thumb);
          updateFromEvent(e, thumb);
        }}
      >
        <div
          className="absolute h-full rounded-full bg-zinc-400"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
        <button
          type="button"
          aria-label="Minimum price"
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 cursor-grab rounded-full border-2 border-white bg-zinc-600 shadow-sm hover:bg-zinc-500 active:cursor-grabbing"
          style={{ left: `${minPercent}%` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleThumbMouseDown("min");
          }}
        />
        <button
          type="button"
          aria-label="Maximum price"
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 cursor-grab rounded-full border-2 border-white bg-zinc-600 shadow-sm hover:bg-zinc-500 active:cursor-grabbing"
          style={{ left: `${maxPercent}%` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleThumbMouseDown("max");
          }}
        />
      </div>
    </div>
  );
}
