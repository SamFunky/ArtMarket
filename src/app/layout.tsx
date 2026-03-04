import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import HeaderWrapper from "@/components/HeaderWrapper";
import Providers from "@/components/Providers";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Curator",
  description: "A marketplace for art",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${syne.variable} ${dmSans.variable} m-0 overflow-x-hidden bg-white font-sans`}>
        <Providers>
          <HeaderWrapper>{children}</HeaderWrapper>
        </Providers>
      </body>
    </html>
  );
}
