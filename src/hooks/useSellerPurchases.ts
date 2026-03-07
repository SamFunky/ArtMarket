"use client";

import { useCallback, useEffect, useState } from "react";
import type { Purchase } from "@/lib/purchases";

export function useSellerPurchases(
  creatorId: string | null,
  listingIds?: string[]
): {
  purchases: Purchase[];
  loading: boolean;
  refetch: () => Promise<void>;
} {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(!!creatorId);

  const load = useCallback(async () => {
    if (!creatorId) {
      setPurchases([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/purchases/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId, listingIds: listingIds ?? [] }),
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = (await res.json()) as Purchase[];
      setPurchases(data);
    } catch {
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [creatorId, listingIds]);

  useEffect(() => {
    load();
  }, [load]);

  return { purchases, loading, refetch: load };
}
