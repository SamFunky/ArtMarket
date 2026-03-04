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

export default function PriceRangeFilter({ min, max, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);
  const [activeThumb, setActiveThumb] = useState<"min" | "max" | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalMin(min);
    setLocalMax(max);
  }, [min, max]);

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
        const newMin = Math.min(value, localMax - STEP);
        setLocalMin(Math.max(PRICE_MIN, newMin));
      } else {
        const newMax = Math.max(value, localMin + STEP);
        setLocalMax(Math.min(PRICE_MAX, newMax));
      }
    },
    [localMin, localMax, percentToValue]
  );

  const handleConfirm = () => {
    onChange(localMin, localMax);
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalMin(PRICE_MIN);
    setLocalMax(PRICE_MAX);
    onChange(PRICE_MIN, PRICE_MAX);
    setIsOpen(false);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;
    setLocalMin(Math.min(Math.max(PRICE_MIN, v), localMax - STEP));
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value.replace(/\D/g, ""), 10) || PRICE_MAX;
    setLocalMax(Math.max(Math.min(PRICE_MAX, v), localMin + STEP));
  };

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

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const id = setTimeout(() => document.addEventListener("click", handleClickOutside), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  const minPercent = valueToPercent(localMin);
  const maxPercent = valueToPercent(localMax);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded-full border-0 bg-white/80 px-4 py-2 text-sm text-zinc-800 ring-1 ring-zinc-200/80 transition-shadow hover:ring-zinc-300"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Price Range
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-3xl border border-zinc-200 bg-white p-4 shadow-lg">
          <div className="flex flex-col gap-4">
            <div
              ref={trackRef}
              className="relative h-2 w-full cursor-pointer rounded-full bg-blue-100"
              onMouseDown={(e) => {
                const rect = trackRef.current?.getBoundingClientRect();
                if (!rect) return;
                const x = (e.clientX - rect.left) / rect.width;
                const mid = (minPercent + maxPercent) / 2 / 100;
                const thumb = x < mid ? "min" : "max";
                setActiveThumb(thumb);
                updateFromEvent(e, thumb);
              }}
            >
              <div
                className="absolute h-full rounded-full bg-blue-500"
                style={{
                  left: `${minPercent}%`,
                  width: `${maxPercent - minPercent}%`,
                }}
              />
              <button
                type="button"
                aria-label="Minimum price"
                className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 cursor-grab rounded-full border-2 border-white bg-blue-500 shadow-sm hover:bg-blue-600 active:cursor-grabbing"
                style={{ left: `${minPercent}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setActiveThumb("min");
                }}
              />
              <button
                type="button"
                aria-label="Maximum price"
                className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 cursor-grab rounded-full border-2 border-white bg-blue-500 shadow-sm hover:bg-blue-600 active:cursor-grabbing"
                style={{ left: `${maxPercent}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setActiveThumb("max");
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-zinc-500">
              <span>{formatPrice(PRICE_MIN)}</span>
              <span>$50,000+</span>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="price-min" className="sr-only">Min $USD</label>
                <input
                  id="price-min"
                  type="text"
                  inputMode="numeric"
                  placeholder="Min $USD"
                  value={localMin === 0 ? "" : localMin.toLocaleString()}
                  onChange={handleMinInputChange}
                  onBlur={() => {
                    if (localMin > localMax - STEP) setLocalMin(localMax - STEP);
                  }}
                  className="w-full rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="price-max" className="sr-only">Max $USD</label>
                <input
                  id="price-max"
                  type="text"
                  inputMode="numeric"
                  placeholder="Max $USD"
                  value={localMax === PRICE_MAX ? "" : localMax.toLocaleString()}
                  onChange={handleMaxInputChange}
                  onBlur={() => {
                    if (localMax < localMin + STEP) setLocalMax(localMin + STEP);
                  }}
                  className="w-full rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 rounded-full bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
