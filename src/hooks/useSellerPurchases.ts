"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

  const listingIdsKey = listingIds?.join(",") ?? "";
  const listingIdsRef = useRef(listingIds);
  listingIdsRef.current = listingIds;

  const hasFetched = useRef(false);
  const lastKeyRef = useRef<string>("");

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
        body: JSON.stringify({
          creatorId,
          listingIds: listingIdsRef.current ?? [],
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = (await res.json()) as Purchase[];
      setPurchases(data);
      hasFetched.current = true;
      lastKeyRef.current = `${creatorId}:${listingIdsRef.current?.join(",") ?? ""}`;
    } catch {
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    const newKey = `${creatorId}:${listingIdsKey}`;
    if (hasFetched.current && newKey === lastKeyRef.current) return;
    if (!hasFetched.current && creatorId && listingIdsKey === "") return;
    load();
  }, [creatorId, listingIdsKey, load]);

  return { purchases, loading, refetch: load };
}
