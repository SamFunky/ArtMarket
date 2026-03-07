"use client";

import Image from "next/image";
import { STORAGE_ASSETS } from "@/lib/storage-assets";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignUp() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await signUp(email, password);
      router.push("/explore");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to create account. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen w-screen items-center justify-center overflow-hidden bg-black">
      <section className="relative flex min-h-screen w-screen shrink-0 items-center justify-center overflow-hidden px-8 pt-20 sm:px-12 sm:pt-0 lg:px-16">
        <div className="absolute inset-x-0 top-0 h-[150vh] min-h-[150vh]">
          <Image
            src={STORAGE_ASSETS.heroImage}
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: "center 600%" }}
            priority={false}
          />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"
          aria-hidden
        />

        <div className="relative z-10 flex w-full justify-center">
          <div className="w-full max-w-[28rem] border border-zinc-200/80 bg-white px-8 py-10 shadow-sm">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[rgb(30,36,44)] sm:text-3xl">
            Sign up
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Create an account to save favorites and place bids.
          </p>

          <form className="mt-8 flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="signup-email" className="text-sm font-medium text-[rgb(30,36,44)]">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-[rgb(30,36,44)] placeholder-zinc-400 transition-shadow focus:outline-none focus:ring-2 focus:ring-zinc-400/50"
                aria-label="Email address"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="signup-password" className="text-sm font-medium text-[rgb(30,36,44)]">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-[rgb(30,36,44)] placeholder-zinc-400 transition-shadow focus:outline-none focus:ring-2 focus:ring-zinc-400/50"
                aria-label="Password"
              />
              <p className="text-xs text-zinc-500">
                At least 8 characters.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="signup-confirm-password" className="text-sm font-medium text-[rgb(30,36,44)]">
                Confirm password
              </label>
              <input
                id="signup-confirm-password"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-[rgb(30,36,44)] placeholder-zinc-400 transition-shadow focus:outline-none focus:ring-2 focus:ring-zinc-400/50"
                aria-label="Confirm password"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full bg-[rgb(30,36,44)] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[rgb(40,48,58)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

            <p className="mt-8 text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-medium text-[rgb(30,36,44)] underline decoration-zinc-400 underline-offset-2 hover:text-[rgb(40,48,58)]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

