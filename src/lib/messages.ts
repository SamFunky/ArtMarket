import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "./firebase";

export const MESSAGES_COLLECTION = "messages";

export type MessageDoc = {
  conversationId: string;
  senderId: string;
  senderEmail: string;
  text: string;
  createdAt: Timestamp;
};

export type Message = MessageDoc & {
  id: string;
};

export function getConversationId(purchaseId: string): string {
  return `purchase-${purchaseId}`;
}

export async function getMessagesForConversation(conversationId: string): Promise<Message[]> {
  const db = getDb();
  if (!db) return [];

  const colRef = collection(db, MESSAGES_COLLECTION);
  const q = query(
    colRef,
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);

  const messages: Message[] = [];
  for (const d of snap.docs) {
    const data = d.data() as MessageDoc;
    messages.push({ id: d.id, ...data });
  }
  return messages;
}

export function subscribeToMessages(
  conversationId: string,
  onMessages: (messages: Message[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getDb();
  if (!db) {
    onMessages([]);
    return () => {};
  }

  const colRef = collection(db, MESSAGES_COLLECTION);
  const q = query(
    colRef,
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    q,
    (snap) => {
      const messages: Message[] = [];
      for (const d of snap.docs) {
        const data = d.data() as MessageDoc;
        messages.push({ id: d.id, ...data });
      }
      onMessages(messages);
    },
    (err) => {
      onError?.(err instanceof Error ? err : new Error(String(err)));
      onMessages([]);
    }
  );
}

export async function sendMessage(params: {
  conversationId: string;
  senderId: string;
  senderEmail: string;
  text: string;
}): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");

  const colRef = collection(db, MESSAGES_COLLECTION);
  await addDoc(colRef, {
    conversationId: params.conversationId,
    senderId: params.senderId,
    senderEmail: params.senderEmail,
    text: params.text.trim(),
    createdAt: serverTimestamp(),
  });
}
