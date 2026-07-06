"use client";

import { useState } from "react";
import { placeBid, getMinimumBid, BID_INCREMENT_PRESETS } from "@/lib/bids";
import type { Item } from "@/data/items";

function formatBid(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type Props = {
  item: Item;
  bidderId: string;
  bidderEmail: string;
  onClose: () => void;
  onSuccess: (newCurrentBid: number) => void | Promise<void>;
};

export default function PlaceBidModal({
  item,
  bidderId,
  bidderEmail,
  onClose,
  onSuccess,
}: Props) {
  const minBid = getMinimumBid(item.currentBid);
  const [amount, setAmount] = useState(minBid);
  const [customInput, setCustomInput] = useState(String(minBid));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function applyIncrement(inc: number) {
    const next = item.currentBid + inc;
    const valid = Math.max(minBid, next);
    setAmount(valid);
    setCustomInput(String(valid));
    setError(null);
  }

  function handleCustomChange(raw: string) {
    setCustomInput(raw);
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n) && n >= minBid) {
      setAmount(n);
      setError(null);
    }
  }

  function getEffectiveAmount(): number {
    const n = parseInt(customInput, 10);
    if (!Number.isNaN(n) && n >= minBid) return n;
    return amount;
  }

  async function submit() {
    const bidAmount = getEffectiveAmount();
    if (bidAmount < minBid) {
      setError(`Minimum bid is ${formatBid(minBid)}.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await placeBid({
        listingId: item.id,
        bidderId,
        bidderEmail,
        amount: bidAmount,
        currentBid: item.currentBid,
      });
      onSuccess(bidAmount);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place bid");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-modal="true"
      aria-labelledby="place-bid-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-line bg-cream p-8 shadow-[0_24px_60px_-20px_rgba(29,26,21,0.5)]"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="place-bid-title" className="font-display text-2xl font-medium text-ink">
          Place bid
        </h2>
        <p className="mt-1 text-sm text-ink-mute">
          Current bid: {formatBid(item.currentBid)} · Minimum: {formatBid(minBid)}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {BID_INCREMENT_PRESETS.map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => applyIncrement(inc)}
              className="label-caps cursor-pointer border border-ink/25 bg-transparent px-4 py-2.5 text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              +{inc}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label htmlFor="custom-bid" className="text-sm font-medium text-ink-soft">
            Custom amount
          </label>
          <div className="mt-1 flex gap-2">
            <span className="flex items-center border border-line bg-paper-deep px-3 text-sm text-ink-mute">
              $
            </span>
            <input
              id="custom-bid"
              type="number"
              min={minBid}
              value={customInput}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="flex-1 border border-line bg-cream px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-oxblood">{error}</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={submitting || getEffectiveAmount() < minBid}
            className="flex-1 cursor-pointer bg-ink px-4 py-3 text-sm font-medium text-paper transition-colors hover:bg-bronze disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              "Placing bid…"
            ) : (
              <>
                Bid {formatBid(getEffectiveAmount())}{" "}
                <span className="text-gilt">
                  +{formatBid(getEffectiveAmount() - item.currentBid)}
                </span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="label-caps flex-1 cursor-pointer border border-ink/25 bg-transparent px-4 py-3 text-ink transition-colors hover:bg-paper-deep disabled:opacity-70"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
