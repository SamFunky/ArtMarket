"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function FixedHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.push("/");
    } catch {}
  }, [router, signOut]);

  const isHomePage = pathname === "/";
  const transparent = isHomePage && !scrolled && !menuOpen;

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`link-underline label-caps transition-colors duration-300 ${
        transparent
          ? "text-paper/80 hover:text-paper"
          : "text-ink-mute hover:text-ink"
      } ${pathname === href ? "is-active" : ""}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full">
      <nav
        className={`flex items-center justify-between border-b px-5 py-4 transition-all duration-500 sm:px-8 lg:px-12 ${
          transparent
            ? "border-line bg-paper md:border-white/15 md:bg-transparent"
            : "border-line bg-paper/95 backdrop-blur-sm"
        }`}
      >
        <Link
          href="/"
          className={`font-display text-xl tracking-tight transition-colors duration-300 sm:text-2xl ${
            transparent ? "text-ink md:text-paper" : "text-ink"
          }`}
        >
          Curator<span className="text-bronze">.</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex lg:gap-10">
          {navLink("/explore", "Explore")}
          {user ? (
            <>
              {navLink("/create-listing", "Consign")}
              {navLink("/account", "Account")}
              <button
                type="button"
                onClick={handleSignOut}
                className={`label-caps cursor-pointer border px-5 py-2.5 transition-all duration-300 ${
                  transparent
                    ? "border-paper/40 text-paper hover:bg-paper hover:text-ink"
                    : "border-ink/25 text-ink hover:bg-ink hover:text-paper"
                }`}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              {navLink("/signin", "Sign in")}
              <Link
                href="/signup"
                className={`label-caps border px-5 py-2.5 transition-all duration-300 ${
                  transparent
                    ? "border-paper/40 text-paper hover:bg-paper hover:text-ink"
                    : "border-ink/25 text-ink hover:bg-ink hover:text-paper"
                }`}
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className={`flex flex-col items-center justify-center gap-[5px] p-2 transition-colors md:hidden ${
            transparent ? "text-ink" : "text-ink"
          }`}
        >
          <span
            className={`block h-px w-6 bg-current transition-transform duration-300 ${
              menuOpen ? "translate-y-[6px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-6 bg-current transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-px w-6 bg-current transition-transform duration-300 ${
              menuOpen ? "-translate-y-[6px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {menuOpen && (
        <div className="border-b border-line bg-paper px-6 pb-8 pt-5 md:hidden">
          <nav className="flex flex-col gap-5">
            <Link href="/explore" className="font-display text-2xl text-ink">
              Explore
            </Link>
            {user ? (
              <>
                <Link href="/create-listing" className="font-display text-2xl text-ink">
                  Consign
                </Link>
                <Link href="/account" className="font-display text-2xl text-ink">
                  Account
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="label-caps mt-3 w-full cursor-pointer bg-ink px-4 py-4 text-paper transition-colors hover:bg-ink-soft"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" className="font-display text-2xl text-ink">
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="label-caps mt-3 block w-full bg-ink px-4 py-4 text-center text-paper transition-colors hover:bg-ink-soft"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
