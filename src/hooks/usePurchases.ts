"use client";

import { useCallback, useEffect, useState } from "react";
import { getPurchasesForUser, type Purchase } from "@/lib/purchases";

export function usePurchases(userId: string | null): {
  purchases: Purchase[];
  loading: boolean;
  refetch: () => Promise<void>;
} {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(!!userId);

  const load = useCallback(async () => {
    if (!userId) {
      setPurchases([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        await fetch("/api/listings/finalize-expired", { method: "POST" }).catch(
          () => {}
        );
      }
      const data = await getPurchasesForUser(userId);
      setPurchases(data);
    } catch {
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { purchases, loading, refetch: load };
}
