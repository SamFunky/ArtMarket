"use client";

import { LikedProvider } from "@/context/LikedContext";
import { AuthProvider } from "@/context/AuthContext";
import { AccountDataProvider } from "@/context/AccountDataContext";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LikedProvider>
        <AccountDataProvider>{children}</AccountDataProvider>
      </LikedProvider>
    </AuthProvider>
  );
}
