import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import HeaderWrapper from "@/components/HeaderWrapper";
import Providers from "@/components/Providers";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Curator — Fine Art Auctions",
  description: "A living auction house for fine art. Discover, bid, and collect.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${fraunces.variable} ${dmSans.variable} grain m-0 overflow-x-hidden bg-paper font-sans page-fade-in`}
      >
        <Providers>
          <HeaderWrapper>{children}</HeaderWrapper>
        </Providers>
      </body>
    </html>
  );
}
