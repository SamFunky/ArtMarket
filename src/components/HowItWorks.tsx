import Reveal from "@/components/Reveal";

const STEPS = [
  {
    number: "I",
    title: "Discover",
    description:
      "Browse a rolling catalogue of paintings, sculpture, and antiquities — from the ancient world to the contemporary studio.",
  },
  {
    number: "II",
    title: "Bid",
    description:
      "Place your bid and watch the room respond. Every lot runs on a live clock; every increment is recorded in the ledger.",
  },
  {
    number: "III",
    title: "Collect",
    description:
      "Win the hammer and the work is yours. Secure checkout, documented provenance, insured shipping to your door.",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full bg-ink px-5 py-20 sm:px-10 sm:py-28 lg:px-14">
      <div className="mx-auto max-w-[110rem]">
        <Reveal className="mb-14 border-b border-white/10 pb-6">
          <p className="label-caps text-gilt">02 — The ritual</p>
          <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-paper sm:text-5xl lg:text-6xl">
            How a lot changes hands
          </h2>
        </Reveal>

        <div className="flex flex-col">
          {STEPS.map((step, i) => (
            <Reveal
              key={step.number}
              delay={i * 100}
              className="group grid grid-cols-1 gap-4 border-b border-white/10 py-10 transition-colors duration-500 hover:bg-white/[0.03] sm:grid-cols-12 sm:items-baseline sm:gap-8 sm:py-12"
            >
              <span className="font-display text-3xl italic text-gilt sm:col-span-2 sm:text-4xl">
                {step.number}
              </span>
              <h3 className="font-display text-3xl text-paper transition-transform duration-500 group-hover:translate-x-2 sm:col-span-4 sm:text-4xl">
                {step.title}
              </h3>
              <p className="max-w-xl text-base leading-relaxed text-paper/60 sm:col-span-6">
                {step.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
