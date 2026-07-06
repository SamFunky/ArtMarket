"use client";

import { useEffect, useRef, useState } from "react";
import {
  getConversationId,
  sendMessage as sendMessageToDb,
  subscribeToMessages,
  type Message,
} from "@/lib/messages";

type Props = {
  purchaseId: string;
  currentUserId: string;
  otherUserId: string;
  currentUserEmail: string;
};

export default function MessageThread({
  purchaseId,
  currentUserId,
  otherUserId,
  currentUserEmail,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const conversationId = getConversationId(purchaseId);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToMessages(
      conversationId,
      (msgs) => {
        setMessages(msgs);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [conversationId]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setError(null);
    setSending(true);
    setInput("");
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      senderEmail: currentUserEmail,
      text,
      createdAt: { toDate: () => new Date() } as Message["createdAt"],
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    try {
      await sendMessageToDb({
        conversationId,
        senderId: currentUserId,
        senderEmail: currentUserEmail,
        text,
      });
    } catch (err) {
      setInput(text);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="border-t border-line bg-paper-deep/50 px-4 py-6 text-center">
        <p className="text-sm text-ink-mute">Loading messages…</p>
      </div>
    );
  }

  return (
    <div className="bg-paper-deep/50">
      <div className="flex max-h-64 flex-col">
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-3"
        >
          {messages.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-mute">
              No messages yet. Start the conversation below.
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => {
                const isMe = m.senderId === currentUserId;
                return (
                  <div
                    key={m.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-none px-3 py-2 text-sm ${
                        isMe
                          ? "bg-ink text-paper"
                          : "bg-cream text-ink ring-1 ring-line"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      <p
                        className={`mt-1 text-[10px] ${
                          isMe ? "text-paper/70" : "text-ink-mute/70"
                        }`}
                      >
                        {(m.createdAt?.toDate?.() ?? new Date()).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {error && (
          <p className="border-t border-line bg-oxblood/10 px-4 py-2 text-sm text-oxblood">
            {error}
          </p>
        )}
        <form onSubmit={handleSend} className="flex gap-2 border-t border-line p-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded border border-line px-3 py-2 text-sm placeholder-ink-mute/60 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="shrink-0 rounded bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
