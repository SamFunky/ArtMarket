export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#faf5f2] pb-20 pt-32">
      <div className="mx-auto w-full max-w-3xl px-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[rgb(30,36,44)] sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-zinc-500">Last updated: January 1, 2025</p>

        <div className="mt-10 flex flex-col gap-10 text-[rgb(30,36,44)]">
          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Information We Collect
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              When you create an account or place a bid on Curator, we collect basic
              information such as your email address. If you complete a purchase, payment
              information is handled securely by our third-party payment processor (Stripe)
              and is never stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              How We Use Your Information
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              We use your information solely to operate the marketplace — to authenticate
              your account, process bids and purchases, and facilitate communication
              between buyers and sellers. We do not sell, rent, or share your personal
              data with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Cookies & Analytics
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              Curator uses essential cookies to keep you signed in and maintain your
              session. We may use anonymised analytics to understand how the site is used
              and improve the experience. No personally identifiable information is shared
              with analytics providers.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Data Retention
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              Account data is retained for as long as your account is active. You may
              request deletion of your account and associated data at any time by
              contacting us.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Contact
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              If you have questions about this policy, please reach out via the contact
              information listed on our site.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
