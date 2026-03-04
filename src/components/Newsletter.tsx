"use client";

import { useState } from "react";

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
    <section className="w-full border-y border-zinc-700/50 bg-[rgb(30,36,44)] px-6 py-16">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Stay in the loop
        </h2>
        <p className="text-sm text-zinc-400">
          Get alerts when new featured auctions go live.
        </p>
        <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            required
            className="flex-1 border border-zinc-600 bg-white px-4 py-3 text-sm text-[rgb(30,36,44)] placeholder-zinc-500 ring-zinc-600 transition-shadow focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <button
            type="submit"
            className="bg-[#faf5f2] px-6 py-3 font-medium text-[rgb(30,36,44)] transition-colors hover:bg-[#f0e6e0]"
          >
            Subscribe
          </button>
        </form>
        {status === "success" && (
          <p className="text-sm text-emerald-400">Thanks! Check your inbox to confirm.</p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-400">Something went wrong. Please try again.</p>
        )}
      </div>
    </section>
  );
}
