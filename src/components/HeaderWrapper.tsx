"use client";

import { usePathname } from "next/navigation";
import FixedHeader from "./FixedHeader";
import Footer from "./Footer";

const NO_FOOTER_PATHS = ["/signin", "/signup"];

export default function HeaderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showFooter = !NO_FOOTER_PATHS.includes(pathname);

  return (
    <>
      <FixedHeader />
      {children}
      {showFooter && <Footer />}
    </>
  );
}
