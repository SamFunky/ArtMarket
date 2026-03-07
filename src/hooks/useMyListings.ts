"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchListingsByCreator } from "@/lib/listings";
import type { Item } from "@/data/items";

export function useMyListings(creatorId: string | null): {
  items: Item[];
  loading: boolean;
  refetch: () => Promise<void>;
} {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(Boolean(creatorId));
  const lastCreatorIdRef = useRef<string | null>(undefined as unknown as null);

  const load = useCallback(async () => {
    if (!creatorId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchListingsByCreator(creatorId);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    if (creatorId === lastCreatorIdRef.current) return;
    lastCreatorIdRef.current = creatorId;
    load();
  }, [creatorId, load]);

  return { items, loading, refetch: load };
}
