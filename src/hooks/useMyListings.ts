"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchListingsByCreator } from "@/lib/listings";
import type { Item } from "@/data/items";

export function useMyListings(creatorId: string | null): {
  items: Item[];
  loading: boolean;
  refetch: () => Promise<void>;
} {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(Boolean(creatorId));

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
    load();
  }, [load]);

  return { items, loading, refetch: load };
}
