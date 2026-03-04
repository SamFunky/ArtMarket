import Image from "next/image";
import Link from "next/link";
import HeroHeader from "@/components/HeroHeader";

export default function SignIn() {
  return (
    <main className="flex min-h-screen w-screen items-center justify-center overflow-hidden bg-black">
      <section className="relative flex min-h-screen w-screen shrink-0 items-center justify-center overflow-hidden px-8 sm:px-12 lg:px-16">
        <HeroHeader />
        <div className="absolute inset-x-0 top-0 h-[150vh] min-h-[150vh]">
          <Image
            src="/artwork/Maecenas Presenting the Liberal Arts to the Emperor Augustus.jpg"
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
            Sign in
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Welcome back. Sign in to your account.
          </p>

          <form className="mt-8 flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-2">
              <label htmlFor="signin-email" className="text-sm font-medium text-[rgb(30,36,44)]">
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-[rgb(30,36,44)] placeholder-zinc-400 transition-shadow focus:outline-none focus:ring-2 focus:ring-zinc-400/50"
                aria-label="Email address"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="signin-password" className="text-sm font-medium text-[rgb(30,36,44)]">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-zinc-500 underline decoration-zinc-400 underline-offset-2 hover:text-[rgb(30,36,44)]"
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
                className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-[rgb(30,36,44)] placeholder-zinc-400 transition-shadow focus:outline-none focus:ring-2 focus:ring-zinc-400/50"
                aria-label="Password"
              />
            </div>
            <button
              type="submit"
              className="mt-2 w-full bg-[rgb(30,36,44)] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[rgb(40,48,58)]"
            >
              Sign in
            </button>
          </form>

            <p className="mt-8 text-center text-sm text-zinc-500">
              Don’t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-[rgb(30,36,44)] underline decoration-zinc-400 underline-offset-2 hover:text-[rgb(40,48,58)]"
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

