import Link from "next/link";

export default function HeroHeader() {
  return (
    <header className="absolute left-1/2 top-4 z-20 w-[calc(100%-1rem)] -translate-x-1/2">
      <nav className="flex items-center justify-between rounded-full px-6 py-4 sm:px-8">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-[#f5e6dc] sm:text-xl"
        >
          Curator
        </Link>
        <div className="flex items-center gap-6 sm:gap-8">
          <Link
            href="/explore"
            className="text-sm text-[#f5e6dc]/90 transition-colors hover:text-[#f5e6dc] sm:text-base"
          >
            Explore
          </Link>
          <Link
            href="/signin"
            className="text-sm text-[#f5e6dc]/90 transition-colors hover:text-[#f5e6dc] sm:text-base"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-[#f5e6dc]/50 bg-transparent px-4 py-2 text-sm font-medium text-[#f5e6dc] transition-colors hover:bg-[#f5e6dc]/10 sm:px-5"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}
