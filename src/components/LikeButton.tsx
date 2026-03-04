"use client";

import { useLiked } from "@/context/LikedContext";

type LikeButtonProps = {
  itemId: string;
  className?: string;
};

export default function LikeButton({ itemId, className = "" }: LikeButtonProps) {
  const { isLiked, toggleLiked } = useLiked();
  const liked = isLiked(itemId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLiked(itemId);
      }}
      className={`group/like rounded-full p-2 transition-colors focus:outline-none focus:ring-0 ${className}`}
      aria-label={liked ? "Remove from liked" : "Add to liked"}
    >
      {liked ? (
        <svg
          className="h-5 w-5 text-red-500 transition-opacity hover:opacity-50"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ) : (
        <svg
          className="h-5 w-5 text-white drop-shadow-md transition-colors group-hover/like:text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  );
}
