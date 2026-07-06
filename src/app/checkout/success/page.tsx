"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const purchaseId = searchParams.get("purchase_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!sessionId || !purchaseId) {
      setStatus("error");
      return;
    }
    fetch("/api/checkout/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, purchaseId }),
    })
      .then((res) => {
        if (res.ok) setStatus("success");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [sessionId, purchaseId]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-paper pt-32 pb-20">
        <div className="mx-auto flex max-w-lg flex-col items-center px-4 text-center">
          <p className="text-sm text-ink-mute">Confirming your payment…</p>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen bg-paper pt-32 pb-20">
        <div className="mx-auto flex max-w-lg flex-col items-center px-4 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Payment confirmation failed
          </h1>
          <p className="mt-4 text-sm text-ink-mute">
            We couldn&apos;t verify your payment. Please check your account or contact support.
          </p>
          <Link
            href="/account"
            className="mt-6 bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-ink-soft"
          >
            Go to Account
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper pt-32 pb-20">
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Payment successful
        </h1>
        <p className="mt-4 text-sm text-ink-mute">
          Thank you for your purchase. You can view your purchase in your account.
        </p>
        <Link
          href="/account"
          className="mt-6 bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-ink-soft"
        >
          Go to Account
        </Link>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-paper pt-32 pb-20">
          <div className="mx-auto flex max-w-lg flex-col items-center px-4 text-center">
            <p className="text-sm text-ink-mute">Loading…</p>
          </div>
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
