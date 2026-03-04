"use client";

import { useEffect, useState } from "react";
import { subscribeToComments, type Comment } from "@/lib/comments";

export function useComments(listingId: string | null): Comment[] {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!listingId) {
      setComments([]);
      return;
    }
    const unsub = subscribeToComments(listingId, setComments);
    return unsub;
  }, [listingId]);

  return comments;
}
