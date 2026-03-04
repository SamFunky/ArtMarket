"use client";

import { usePathname } from "next/navigation";
import FixedHeader from "./FixedHeader";

export default function HeaderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeader = pathname === "/signin" || pathname === "/signup";

  return (
    <>
      {!hideHeader && <FixedHeader />}
      {children}
    </>
  );
}

