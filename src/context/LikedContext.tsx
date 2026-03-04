"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "curator-liked";

type LikedContextValue = {
  likedIds: Set<string>;
  toggleLiked: (id: string) => void;
  isLiked: (id: string) => boolean;
};

const LikedContext = createContext<LikedContextValue | null>(null);

function loadLikedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveLikedIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
  }
}

export function LikedProvider({ children }: { children: ReactNode }) {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLikedIds(loadLikedIds());
  }, []);

  const toggleLiked = useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveLikedIds(next);
      return next;
    });
  }, []);

  const isLiked = useCallback(
    (id: string) => likedIds.has(id),
    [likedIds]
  );

  const value: LikedContextValue = { likedIds, toggleLiked, isLiked };

  return (
    <LikedContext.Provider value={value}>{children}</LikedContext.Provider>
  );
}

export function useLiked() {
  const ctx = useContext(LikedContext);
  if (!ctx) throw new Error("useLiked must be used within LikedProvider");
  return ctx;
}
