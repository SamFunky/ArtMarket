import Link from "next/link";

const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Browse",
    links: [{ href: "/explore", label: "Explore" }],
  },
  {
    heading: "Account",
    links: [
      { href: "/signin", label: "Sign in" },
      { href: "/signup", label: "Sign up" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-ink px-6 pb-10 pt-20 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-[110rem]">
        <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <p className="label-caps text-gilt">The auction house</p>
            <p className="mt-5 font-display text-2xl leading-snug text-paper sm:text-3xl">
              Every work has a next chapter. Write yours into its provenance.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className="label-caps text-paper/40">{col.heading}</h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="link-underline text-sm text-paper/80 transition-colors hover:text-paper"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/"
          aria-label="Curator home"
          className="mt-20 block select-none overflow-hidden"
        >
          <span className="block text-center font-display text-[clamp(4rem,17vw,17rem)] font-medium leading-[0.95] tracking-tight text-paper/90 transition-colors duration-500 hover:text-paper">
            Curator<span className="text-bronze">.</span>
          </span>
        </Link>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="label-caps text-paper/35">
            © {new Date().getFullYear()} Curator
          </p>
          <p className="label-caps text-paper/35">Fine art, live auctions</p>
        </div>
      </div>
    </footer>
  );
}
