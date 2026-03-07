"use client";

import { useCallback, useEffect, useState } from "react";
import { getConversationId, subscribeToMessages, type Message } from "@/lib/messages";

const LAST_READ_KEY = "artmarket-lastRead";

function getLastRead(purchaseId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(`${LAST_READ_KEY}-${purchaseId}`);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function setLastRead(purchaseId: string, timestamp: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${LAST_READ_KEY}-${purchaseId}`, String(timestamp));
  } catch {}
}

export function useUnreadMessages(
  purchaseId: string | null,
  currentUserId: string,
  otherUserId: string,
  isThreadOpen: boolean
): { unreadCount: number; markAsRead: () => void } {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastRead, setLastReadState] = useState(0);

  useEffect(() => {
    if (!purchaseId) return;
    setLastReadState(getLastRead(purchaseId));
    const conversationId = getConversationId(purchaseId);
    const unsubscribe = subscribeToMessages(
      conversationId,
      (msgs) => setMessages(msgs),
      () => setMessages([])
    );
    return unsubscribe;
  }, [purchaseId]);

  const markAsRead = useCallback(() => {
    if (!purchaseId) return;
    const now = Date.now();
    const latest = messages
      .filter((m) => m.senderId !== currentUserId)
      .reduce((max, m) => {
        const ms = m.createdAt?.toMillis?.() ?? 0;
        return Math.max(max, ms);
      }, 0);
    const ts = latest > 0 ? latest : now;
    setLastRead(purchaseId, ts);
    setLastReadState(ts);
  }, [purchaseId, currentUserId, messages]);

  useEffect(() => {
    if (isThreadOpen) markAsRead();
  }, [isThreadOpen, markAsRead]);

  const unreadCount = messages.filter((m) => {
    if (m.senderId === currentUserId) return false;
    const ms = m.createdAt?.toMillis?.() ?? 0;
    return ms > lastRead;
  }).length;

  return { unreadCount, markAsRead };
}
