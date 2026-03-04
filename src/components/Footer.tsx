import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[rgb(30,36,44)] px-6 py-14">
      <div className="mx-auto flex max-w-[120rem] flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/"
            className="font-display text-xl font-semibold tracking-tight text-white"
          >
            Curator
          </Link>
          <p className="mt-2 max-w-xs text-sm text-zinc-400">
            A marketplace for fine art. Discover, bid, and collect.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Browse
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link
                  href="/explore"
                  className="text-sm text-zinc-300 transition-colors hover:text-white"
                >
                  Explore
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Account
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link
                  href="/signin"
                  className="text-sm text-zinc-300 transition-colors hover:text-white"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-sm text-zinc-300 transition-colors hover:text-white"
                >
                  Sign up
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Legal
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-zinc-300 transition-colors hover:text-white"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-zinc-300 transition-colors hover:text-white"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-[120rem] border-t border-zinc-800 pt-8">
        <p className="text-xs text-zinc-500">© {new Date().getFullYear()} Curator. All rights reserved.</p>
      </div>
    </footer>
  );
}
