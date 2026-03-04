export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Discover",
      description: "Browse curated art from ancient to contemporary. Filter by era, type, and price.",
    },
    {
      number: "2",
      title: "Bid",
      description: "Place your bid on pieces you love. Our live auctions keep the excitement real.",
    },
    {
      number: "3",
      title: "Win",
      description: "Outbid others before time runs out. Secure checkout and worldwide shipping.",
    },
  ];

  return (
    <section className="w-full bg-[rgb(30,36,44)] px-6 py-20">
      <div className="mx-auto max-w-[120rem]">
        <h2 className="mb-16 text-center font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          How it works
        </h2>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center gap-4 text-center">
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#faf5f2] font-display text-lg font-bold text-[rgb(30,36,44)]"
                aria-hidden
              >
                {step.number}
              </span>
              <h3 className="font-display text-xl font-semibold text-white">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
