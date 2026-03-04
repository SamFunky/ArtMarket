import Link from "next/link";

export default function HeroHeader() {
  return (
    <header className="absolute left-1/2 top-4 z-20 w-[calc(100%-1rem)] -translate-x-1/2">
      <nav className="flex items-center justify-between rounded-full px-6 py-4 sm:px-8">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-[#faf5f2] sm:text-xl"
        >
          Curator
        </Link>
        <div className="flex items-center gap-6 sm:gap-8">
          <Link
            href="/explore"
            className="text-sm text-[#faf5f2]/90 transition-colors hover:text-[#faf5f2] sm:text-base"
          >
            Explore
          </Link>
          <Link
            href="/signin"
            className="text-sm text-[#faf5f2]/90 transition-colors hover:text-[#faf5f2] sm:text-base"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-[#faf5f2]/50 bg-transparent px-4 py-2 text-sm font-medium text-[#faf5f2] transition-colors hover:bg-[#faf5f2]/10 sm:px-5"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}
