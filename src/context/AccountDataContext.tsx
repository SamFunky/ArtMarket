"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchListingsByCreator } from "@/lib/listings";
import { getPurchasesForUser, type Purchase } from "@/lib/purchases";
import type { Item } from "@/data/items";

type AccountData = {
  myListings: Item[];
  listingsLoading: boolean;
  purchases: Purchase[];
  purchasesLoading: boolean;
  sellerPurchases: Purchase[];
  sellerPurchasesLoading: boolean;
  refetchPurchases: () => Promise<void>;
  refetchAll: () => Promise<void>;
};

const AccountDataContext = createContext<AccountData | null>(null);

export function AccountDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [myListings, setMyListings] = useState<Item[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);

  const [sellerPurchases, setSellerPurchases] = useState<Purchase[]>([]);
  const [sellerPurchasesLoading, setSellerPurchasesLoading] = useState(false);

  const lastUidRef = useRef<string | null>(null);

  const fetchListings = useCallback(async (uid: string): Promise<Item[]> => {
    setListingsLoading(true);
    try {
      const data = await fetchListingsByCreator(uid);
      setMyListings(data);
      return data;
    } catch {
      setMyListings([]);
      return [];
    } finally {
      setListingsLoading(false);
    }
  }, []);

  const fetchPurchases = useCallback(async (uid: string) => {
    setPurchasesLoading(true);
    try {
      await fetch("/api/listings/finalize-expired", { method: "POST" }).catch(() => {});
      const data = await getPurchasesForUser(uid);
      setPurchases(data);
    } catch {
      setPurchases([]);
    } finally {
      setPurchasesLoading(false);
    }
  }, []);

  const fetchSellerPurchases = useCallback(async (uid: string, listingIds: string[]) => {
    if (!listingIds.length) {
      setSellerPurchases([]);
      setSellerPurchasesLoading(false);
      return;
    }
    setSellerPurchasesLoading(true);
    try {
      const res = await fetch("/api/purchases/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: uid, listingIds }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as Purchase[];
      setSellerPurchases(data);
    } catch {
      setSellerPurchases([]);
    } finally {
      setSellerPurchasesLoading(false);
    }
  }, []);

  const refetchAll = useCallback(async () => {
    if (!user) return;
    const [listings] = await Promise.all([
      fetchListings(user.uid),
      fetchPurchases(user.uid),
    ]);
    await fetchSellerPurchases(user.uid, listings.map((l) => l.id));
  }, [user, fetchListings, fetchPurchases, fetchSellerPurchases]);

  const refetchPurchases = useCallback(async () => {
    if (!user) return;
    await fetchPurchases(user.uid);
  }, [user, fetchPurchases]);

  useEffect(() => {
    if (user?.uid === lastUidRef.current) return;
    lastUidRef.current = user?.uid ?? null;

    if (!user) {
      setMyListings([]);
      setPurchases([]);
      setSellerPurchases([]);
      setListingsLoading(false);
      setPurchasesLoading(false);
      setSellerPurchasesLoading(false);
      return;
    }

    const uid = user.uid;
    fetchPurchases(uid);
    fetchListings(uid).then((listings) => {
      fetchSellerPurchases(uid, listings.map((l) => l.id));
    });
  }, [user, fetchListings, fetchPurchases, fetchSellerPurchases]);

  return (
    <AccountDataContext.Provider
      value={{
        myListings,
        listingsLoading,
        purchases,
        purchasesLoading,
        sellerPurchases,
        sellerPurchasesLoading,
        refetchPurchases,
        refetchAll,
      }}
    >
      {children}
    </AccountDataContext.Provider>
  );
}

export function useAccountData(): AccountData {
  const ctx = useContext(AccountDataContext);
  if (!ctx) throw new Error("useAccountData must be used within AccountDataProvider");
  return ctx;
}
