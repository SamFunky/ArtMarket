export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#faf5f2] pb-20 pt-32">
      <div className="mx-auto w-full max-w-3xl px-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[rgb(30,36,44)] sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-zinc-500">Last updated: January 1, 2025</p>

        <div className="mt-10 flex flex-col gap-10 text-[rgb(30,36,44)]">
          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Acceptance of Terms
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              By accessing or using Curator, you agree to be bound by these Terms of
              Service. If you do not agree, please do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Bidding & Purchases
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              All bids placed on Curator are binding. When you win an auction, you are
              obligated to complete the purchase. Failure to pay within the allotted time
              may result in account suspension. Sellers are responsible for accurately
              representing their listed works.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Prohibited Conduct
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              You may not use Curator to list counterfeit or stolen artworks, manipulate
              auction outcomes, harass other users, or engage in any activity that
              violates applicable law. We reserve the right to remove listings and
              suspend accounts that violate these guidelines.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Limitation of Liability
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              Curator acts as a marketplace platform and is not a party to transactions
              between buyers and sellers. We are not responsible for the condition,
              authenticity, or delivery of items. To the fullest extent permitted by law,
              Curator's liability is limited to the fees collected on a given transaction.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Changes to Terms
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              We may update these Terms from time to time. Continued use of the platform
              after changes are posted constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Contact
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              Questions about these Terms? Reach out via the contact information listed
              on our site.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
