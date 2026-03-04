"use client";

import { LikedProvider } from "@/context/LikedContext";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <LikedProvider>{children}</LikedProvider>;
}
