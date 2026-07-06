"use client";

import Image from "next/image";
import { STORAGE_ASSETS } from "@/lib/storage-assets";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignIn() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    try {
      setSubmitting(true);
      setError(null);
      await signIn(email, password);
      router.push("/explore");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to sign in. Please try again.";
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
            unoptimized
            className="object-cover object-center"
            priority={false}
          />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent"
          aria-hidden
        />

        <div className="relative z-10 flex w-full justify-center">
          <div className="w-full max-w-[28rem] border border-line bg-cream px-8 py-10 shadow-[0_24px_60px_-20px_rgba(29,26,21,0.5)]">
          <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-ink-mute">
            Welcome back. Sign in to your account.
          </p>

          <form className="mt-8 flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="signin-email" className="text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-line bg-cream px-4 py-3 text-sm text-ink placeholder-ink-mute/60 transition-colors focus:border-ink focus:outline-none"
                aria-label="Email address"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="signin-password" className="text-sm font-medium text-ink">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-ink-mute underline decoration-bronze underline-offset-2 hover:text-ink"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="signin-password"
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-line bg-cream px-4 py-3 text-sm text-ink placeholder-ink-mute/60 transition-colors focus:border-ink focus:outline-none"
                aria-label="Password"
              />
            </div>
            {error && (
              <p className="text-sm text-oxblood">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full bg-ink px-4 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

            <p className="mt-8 text-center text-sm text-ink-mute">
              Don’t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-ink underline decoration-bronze underline-offset-2 hover:text-ink-soft"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

