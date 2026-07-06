"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  createListing,
  LISTING_DURATION_DAYS,
  type CreateListingInput,
  type ListingDurationDays,
} from "@/lib/listings";
import type { ArtEra, ArtType } from "@/data/items";

const CATEGORIES: { value: CreateListingInput["category"]; label: string }[] = [
  { value: "painting", label: "Painting" },
  { value: "sculpture", label: "Sculpture" },
  { value: "artifact", label: "Artifact" },
];

const ERAS: { value: ArtEra; label: string }[] = [
  { value: "ancient", label: "Ancient" },
  { value: "classical", label: "Classical" },
  { value: "renaissance", label: "Renaissance" },
  { value: "baroque", label: "Baroque" },
  { value: "modern", label: "Modern" },
  { value: "contemporary", label: "Contemporary" },
];

const ART_TYPES: { value: ArtType; label: string }[] = [
  { value: "oil painting", label: "Oil Painting" },
  { value: "watercolor", label: "Watercolor" },
  { value: "drawing", label: "Drawing" },
  { value: "sculpture", label: "Sculpture" },
  { value: "ceramic", label: "Ceramic" },
  { value: "mixed media", label: "Mixed Media" },
];

export default function CreateListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<CreateListingInput, "creatorId">>({
    title: "",
    category: "painting",
    currentBid: 0,
    era: "modern",
    artType: "oil painting",
    durationDays: 7,
    description: "",
    dateRange: "",
    image: "",
  });

  if (!user) {
    return (
      <main className="min-h-screen bg-paper pt-32 pb-20">
        <div className="mx-auto flex w-full max-w-[120rem] flex-col items-center px-4 sm:px-6 xl:px-12 text-center">
          <h1 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            Create Listing
          </h1>
          <p className="mt-4 text-sm text-ink-mute">
            You need to be signed in to create a listing.
          </p>
          <Link
            href="/signin"
            className="mt-6 bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) return;
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    try {
      const id = await createListing({ ...form, creatorId: user.uid });
      router.push(`/item/${id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create listing. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper pt-32 pb-20">
      <div className="mx-auto w-full max-w-2xl px-4">
        <h1 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
          Create Listing
        </h1>
        <p className="mt-2 text-sm text-ink-mute">
          Add a new item to the marketplace.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded border border-line bg-cream/80 p-6 shadow-sm"
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-ink"
              >
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Renaissance portrait"
                className="mt-1 w-full rounded border border-line bg-cream px-3 py-2 text-sm text-ink placeholder-ink-mute/60 transition-colors focus:border-ink focus:outline-none focus:ring-0"
                required
              />
            </div>

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-ink"
              >
                Image URL
              </label>
              <input
                id="image"
                type="url"
                value={form.image ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image: e.target.value }))
                }
                placeholder="https://..."
                className="mt-1 w-full rounded border border-line bg-cream px-3 py-2 text-sm text-ink placeholder-ink-mute/60 transition-colors focus:border-ink focus:outline-none focus:ring-0"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-ink"
              >
                Description
              </label>
              <textarea
                id="description"
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Brief description of the piece"
                rows={3}
                className="mt-1 w-full resize-none rounded border border-line bg-cream px-3 py-2 text-sm text-ink placeholder-ink-mute/60 transition-colors focus:border-ink focus:outline-none focus:ring-0"
              />
            </div>

            <div>
              <label
                htmlFor="currentBid"
                className="block text-sm font-medium text-ink"
              >
                Starting bid (USD) *
              </label>
              <input
                id="currentBid"
                type="number"
                min={0}
                step={1}
                value={form.currentBid || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    currentBid: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0"
                className="mt-1 w-full rounded border border-line bg-cream px-3 py-2 text-sm text-ink placeholder-ink-mute/60 transition-colors focus:border-ink focus:outline-none focus:ring-0"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-ink"
              >
                Category *
              </label>
              <select
                id="category"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as CreateListingInput["category"],
                  }))
                }
                className="mt-1 w-full rounded border border-line bg-cream px-3 py-2 text-sm text-ink transition-colors focus:border-ink focus:outline-none focus:ring-0"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="era"
                className="block text-sm font-medium text-ink"
              >
                Era *
              </label>
              <select
                id="era"
                value={form.era}
                onChange={(e) =>
                  setForm((f) => ({ ...f, era: e.target.value as ArtEra }))
                }
                className="mt-1 w-full rounded border border-line bg-cream px-3 py-2 text-sm text-ink transition-colors focus:border-ink focus:outline-none focus:ring-0"
              >
                {ERAS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="artType"
                className="block text-sm font-medium text-ink"
              >
                Art type *
              </label>
              <select
                id="artType"
                value={form.artType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, artType: e.target.value as ArtType }))
                }
                className="mt-1 w-full rounded border border-line bg-cream px-3 py-2 text-sm text-ink transition-colors focus:border-ink focus:outline-none focus:ring-0"
              >
                {ART_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="durationDays"
                className="block text-sm font-medium text-ink"
              >
                Auction length *
              </label>
              <select
                id="durationDays"
                value={form.durationDays}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    durationDays: Number(e.target.value) as ListingDurationDays,
                  }))
                }
                className="mt-1 w-full rounded border border-line bg-cream px-3 py-2 text-sm text-ink transition-colors focus:border-ink focus:outline-none focus:ring-0"
              >
                {LISTING_DURATION_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d} day{d !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="dateRange"
                className="block text-sm font-medium text-ink"
              >
                Date / age range
              </label>
              <input
                id="dateRange"
                type="text"
                value={form.dateRange ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateRange: e.target.value }))
                }
                placeholder="e.g. 200 BCE – 100 BCE"
                className="mt-1 w-full rounded border border-line bg-cream px-3 py-2 text-sm text-ink placeholder-ink-mute/60 transition-colors focus:border-ink focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {error && (
            <p className="mt-6 text-sm text-oxblood">{error}</p>
          )}

          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-70"
            >
              {submitting ? "Creating…" : "Create listing"}
            </button>
            <Link
              href="/explore"
              className="rounded border border-ink/25 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper-deep"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
