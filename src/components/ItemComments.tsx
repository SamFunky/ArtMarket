"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useComments } from "@/hooks/useComments";
import { addComment, addReply, deleteComment, type Comment } from "@/lib/comments";
import { isFirebaseConfigured } from "@/lib/firebase";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function CommentItem({
  comment,
  replies,
  listingId,
  listingCreatorId,
  currentUserId,
  currentUserEmail,
  depth = 0,
}: {
  comment: Comment;
  replies: Comment[];
  listingId: string;
  listingCreatorId: string | null;
  currentUserId: string | null;
  currentUserEmail: string | null;
  depth?: number;
}) {
  const isOP = Boolean(listingCreatorId && comment.authorId === listingCreatorId);
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repliesExpanded, setRepliesExpanded] = useState(true);

  const isOwnComment = Boolean(currentUserId && comment.authorId === currentUserId);

  function closeDeleteConfirm() {
    if (!deleting) setShowDeleteConfirm(false);
  }

  async function confirmDeleteComment() {
    if (!currentUserId || comment.authorId !== currentUserId) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteComment(listingId, comment.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete comment");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !currentUserId) return;
    setSubmitting(true);
    setError(null);
    try {
      await addReply(
        listingId,
        comment.id,
        replyText,
        currentUserId,
        currentUserEmail
      );
      setReplyText("");
      setShowReplyInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  }

  const isReply = depth > 0;

  return (
    <div
      className={isReply ? "ml-6 border-l-2 border-zinc-200 pl-4" : ""}
    >
      <div className="px-1 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm font-medium text-[rgb(30,36,44)]">
            {comment.authorEmail ?? "Anonymous"}
            {isOP && (
              <span
                className="rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                title="This person owns this listing"
              >
                OP
              </span>
            )}
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">
              {formatDate(comment.createdAt)}
            </span>
            {isOwnComment && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-70"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            )}
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-700">{comment.text}</p>
        {!isReply && depth === 0 && (
          <div className="mt-2 flex items-center gap-2">
            {currentUserId && (
              <button
                type="button"
                onClick={() => setShowReplyInput((v) => !v)}
                className="text-xs font-medium text-zinc-500 hover:text-[rgb(30,36,44)]"
              >
                {showReplyInput ? "Cancel" : "Reply"}
              </button>
            )}
            {replies.length > 0 && (
              <>
                <span className="text-xs tabular-nums text-zinc-500">
                  ({replies.length})
                </span>
                <button
                  type="button"
                  onClick={() => setRepliesExpanded((v) => !v)}
                  className="flex items-center text-zinc-500 hover:text-[rgb(30,36,44)]"
                  aria-expanded={repliesExpanded}
                  aria-label={repliesExpanded ? "Collapse replies" : "Expand replies"}
                >
                  <svg
                    className={`h-4 w-4 transition-transform ${repliesExpanded ? "" : "-rotate-90"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          aria-modal="true"
          aria-labelledby="delete-comment-confirm-title"
          onClick={closeDeleteConfirm}
        >
          <div
            className="w-full max-w-md rounded border border-zinc-200 bg-white p-6 shadow-lg"
            role="dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-comment-confirm-title" className="font-display text-lg font-semibold text-[rgb(30,36,44)]">
              Delete comment?
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Are you sure you want to delete this comment? This cannot be undone.
            </p>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={confirmDeleteComment}
                disabled={deleting}
                className="flex-1 rounded bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-70"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                type="button"
                onClick={closeDeleteConfirm}
                disabled={deleting}
                className="flex-1 rounded border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showReplyInput && depth === 0 && (
        <form
          onSubmit={handleSubmitReply}
          className="mt-3"
        >
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-[rgb(30,36,44)] placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400/50"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={submitting || !replyText.trim()}
              className="rounded bg-[rgb(30,36,44)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[rgb(40,48,58)] disabled:opacity-70"
            >
              {submitting ? "Posting…" : "Post reply"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReplyInput(false);
                setReplyText("");
              }}
              className="rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {replies.length > 0 && repliesExpanded && (
        <div className="mt-3 space-y-3">
          {replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              replies={[]}
              listingId={listingId}
              listingCreatorId={listingCreatorId}
              currentUserId={currentUserId}
              currentUserEmail={currentUserEmail}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type ItemCommentsProps = {
  listingId: string;
  creatorId?: string | null;
};

export default function ItemComments({ listingId, creatorId: listingCreatorId = null }: ItemCommentsProps) {
  const { user } = useAuth();
  const comments = useComments(listingId);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topLevel = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parentId === parentId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await addComment(
        listingId,
        newComment,
        user.uid,
        user.email ?? null
      );
      setNewComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  const hasFirebase = isFirebaseConfigured();

  return (
    <section className="rounded border border-zinc-200 bg-white/80 p-6">
      <h2 className="font-display text-lg font-semibold text-[rgb(30,36,44)]">
        Questions &amp; comments
      </h2>
      <p className="mt-2 text-sm text-zinc-600">
        Bidders can ask questions about condition, provenance, or shipping
        here.
      </p>

      {!hasFirebase ? (
        <div className="mt-4 rounded border border-dashed border-zinc-300 bg-zinc-50/50 py-8 text-center">
          <p className="text-sm text-zinc-500">
            Comments require Firebase. Configure it to enable this feature.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 rounded border border-zinc-200 bg-white px-5 shadow-sm">
            {topLevel.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-zinc-500">No comments yet</p>
              </div>
            ) : (
              <div className="pt-3 pb-6">
              {              topLevel.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  replies={getReplies(c.id)}
                  listingId={listingId}
                  listingCreatorId={listingCreatorId}
                  currentUserId={user?.uid ?? null}
                  currentUserEmail={user?.email ?? null}
                />
              ))}
              </div>
            )}
          </div>

          {user ? (
            <form onSubmit={handleSubmit} className="mt-6">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ask a question or add a comment..."
                className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-[rgb(30,36,44)] placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400/50"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="mt-2 rounded bg-[rgb(30,36,44)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[rgb(40,48,58)] disabled:opacity-70"
              >
                {submitting ? "Posting…" : "Post comment"}
              </button>
            </form>
          ) : (
            <p className="mt-6 text-sm text-zinc-500">
              <Link
                href="/signin"
                className="font-medium text-[rgb(30,36,44)] underline hover:no-underline"
              >
                Sign in
              </Link>{" "}
              to post a comment or question.
            </p>
          )}
        </>
      )}
    </section>
  );
}
