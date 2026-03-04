"use client";

import { useEffect, useRef, useState } from "react";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

export default function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: Props<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? label;

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

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded-full border-0 bg-white/80 px-4 py-2 text-sm text-zinc-800 ring-1 ring-zinc-200/80 transition-shadow hover:ring-zinc-300"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={label}
      >
        {selectedLabel}
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
        <ul
          role="listbox"
          className="absolute left-0 top-full z-50 mt-2 max-h-60 min-w-full overflow-auto rounded-3xl border border-zinc-200 bg-white py-1 shadow-lg"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`cursor-pointer px-4 py-2.5 text-sm ${
                opt.value === value
                  ? "bg-blue-500 text-white"
                  : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
