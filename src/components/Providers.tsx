"use client";

import { LikedProvider } from "@/context/LikedContext";
import { AuthProvider } from "@/context/AuthContext";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LikedProvider>{children}</LikedProvider>
    </AuthProvider>
  );
}
