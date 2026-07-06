"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("success");
    setEmail("");
  }

  return (
    <section className="w-full border-y border-line bg-paper-deep px-5 py-20 sm:px-10 sm:py-24">
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <p className="label-caps text-bronze">The dispatch</p>
        <h2 className="font-display text-3xl font-medium leading-tight tracking-tight text-ink sm:text-5xl">
          First word when a new lot
          <br className="hidden sm:block" /> goes <span className="italic text-bronze">under the hammer</span>
        </h2>
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-lg flex-col gap-5 sm:flex-row sm:items-end"
        >
          <div className="flex-1 border-b border-ink/30 transition-colors focus-within:border-ink">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              required
              suppressHydrationWarning
              className="w-full bg-transparent px-1 py-3 text-base text-ink placeholder-ink-mute/60 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="label-caps shrink-0 bg-ink px-8 py-4 text-paper transition-colors duration-300 hover:bg-bronze"
          >
            Subscribe
          </button>
        </form>
        {status === "success" && (
          <p className="text-sm text-bronze">Noted. Check your inbox to confirm.</p>
        )}
        {status === "error" && (
          <p className="text-sm text-oxblood">Something went wrong. Please try again.</p>
        )}
      </Reveal>
    </section>
  );
}
