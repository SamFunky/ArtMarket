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
        className={`label-caps flex cursor-pointer items-center gap-2 px-4 py-2.5 transition-all ${
          value === options[0]?.value
            ? "bg-cream text-ink ring-1 ring-line hover:ring-ink/40"
            : "bg-ink text-paper"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={label}
      >
        {selectedLabel}
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
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
          className="absolute left-0 top-full z-50 mt-2 max-h-64 min-w-full overflow-auto border border-line bg-cream py-1 shadow-[0_18px_40px_-18px_rgba(29,26,21,0.35)]"
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
              className={`cursor-pointer whitespace-nowrap px-4 py-2.5 text-sm transition-colors ${
                opt.value === value
                  ? "bg-ink text-paper"
                  : "text-ink hover:bg-paper-deep"
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
