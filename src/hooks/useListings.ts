"use client";

import { useCallback, useEffect, useState } from "react";
import { allItems, type Item } from "@/data/items";
import { isFirebaseConfigured } from "@/lib/firebase";
import { fetchListings } from "@/lib/listings";

type UseListingsResult = {
  items: Item[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export function useListings(): UseListingsResult {
  const [items, setItems] = useState<Item[]>(allItems);
  const [loading, setLoading] = useState(isFirebaseConfigured());
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setItems(allItems);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchListings();
      setItems(data.length > 0 ? data : allItems);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load listings"));
      setItems(allItems);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, error, refetch: load };
}
