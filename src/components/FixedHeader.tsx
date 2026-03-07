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
  const transparent = isHomePage && !scrolled;

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full">
      <nav
        className={`flex items-center justify-between border-b px-6 py-4 transition-all duration-300 sm:px-8 ${
          transparent
            ? "border-[#e5ddd5] bg-[#faf5f2] md:border-white/10 md:bg-transparent"
            : "border-[#e5ddd5] bg-[#faf5f2]"
        }`}
      >
        <Link
          href="/"
          className={`font-display text-lg font-semibold tracking-tight transition-colors duration-300 sm:text-xl ${
            transparent ? "text-[rgb(30,36,44)] md:text-white" : "text-[rgb(30,36,44)]"
          }`}
        >
          Curator
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex md:gap-8">
          <Link
            href="/explore"
            className={`text-sm transition-colors duration-300 sm:text-base ${
              transparent
                ? "text-white/90 hover:text-white"
                : "text-zinc-700 hover:text-[rgb(30,36,44)]"
            }`}
          >
            Explore
          </Link>
          {user ? (
            <>
              <Link
                href="/create-listing"
                className={`text-sm transition-colors duration-300 sm:text-base ${
                  transparent
                    ? "text-white/90 hover:text-white"
                    : "text-zinc-700 hover:text-[rgb(30,36,44)]"
                }`}
              >
                Create Listing
              </Link>
              <Link
                href="/account"
                className={`text-sm transition-colors duration-300 sm:text-base ${
                  transparent
                    ? "text-white/90 hover:text-white"
                    : "text-zinc-700 hover:text-[rgb(30,36,44)]"
                }`}
              >
                Account
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 sm:px-5 ${
                  transparent
                    ? "bg-white text-[rgb(30,36,44)] hover:bg-[#f0e6e0]"
                    : "bg-[rgb(30,36,44)] text-white hover:bg-[rgb(40,48,58)]"
                }`}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className={`text-sm transition-colors duration-300 sm:text-base ${
                  transparent
                    ? "text-white/90 hover:text-white"
                    : "text-zinc-700 hover:text-[rgb(30,36,44)]"
                }`}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={`px-4 py-2 text-sm font-medium transition-colors duration-300 sm:px-5 ${
                  transparent
                    ? "bg-white text-[rgb(30,36,44)] hover:bg-[#f0e6e0]"
                    : "bg-[rgb(30,36,44)] text-white hover:bg-[rgb(40,48,58)]"
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
          className="flex flex-col items-center justify-center gap-[5px] rounded p-2 text-[rgb(30,36,44)] transition-colors hover:bg-zinc-100 md:hidden"
        >
          <span
            className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${
              menuOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-current transition-opacity duration-200 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${
              menuOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {menuOpen && (
        <div className="border-b border-[#e5ddd5] bg-[#faf5f2] px-6 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              href="/explore"
              className="text-base text-zinc-700 transition-colors hover:text-[rgb(30,36,44)]"
            >
              Explore
            </Link>
            {user ? (
              <>
                <Link
                  href="/create-listing"
                  className="text-base text-zinc-700 transition-colors hover:text-[rgb(30,36,44)]"
                >
                  Create Listing
                </Link>
                <Link
                  href="/account"
                  className="text-base text-zinc-700 transition-colors hover:text-[rgb(30,36,44)]"
                >
                  Account
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-2 w-full cursor-pointer bg-[rgb(30,36,44)] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[rgb(40,48,58)]"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-base text-zinc-700 transition-colors hover:text-[rgb(30,36,44)]"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="mt-2 block w-full bg-[rgb(30,36,44)] px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-[rgb(40,48,58)]"
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
