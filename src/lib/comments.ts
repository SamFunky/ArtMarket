import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  Timestamp,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "./firebase";

export const COMMENTS_SUBCOLLECTION = "comments";

export type Comment = {
  id: string;
  listingId: string;
  authorId: string;
  authorEmail: string | null;
  text: string;
  createdAt: Date;
  parentId: string | null;
};

export type CommentDoc = {
  authorId: string;
  authorEmail: string | null;
  text: string;
  createdAt: { toDate: () => Date };
  parentId: string | null;
};

function docToComment(
  id: string,
  listingId: string,
  data: CommentDoc
): Comment {
  return {
    id,
    listingId,
    authorId: data.authorId,
    authorEmail: data.authorEmail,
    text: data.text,
    createdAt: data.createdAt.toDate(),
    parentId: data.parentId ?? null,
  };
}

export async function addComment(
  listingId: string,
  text: string,
  authorId: string,
  authorEmail: string | null
): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");

  const colRef = collection(db, "listings", listingId, COMMENTS_SUBCOLLECTION);
  const ref = await addDoc(colRef, {
    authorId,
    authorEmail,
    text: text.trim(),
    createdAt: Timestamp.now(),
    parentId: null,
  });
  return ref.id;
}

export async function addReply(
  listingId: string,
  parentId: string,
  text: string,
  authorId: string,
  authorEmail: string | null
): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");

  const colRef = collection(db, "listings", listingId, COMMENTS_SUBCOLLECTION);
  const ref = await addDoc(colRef, {
    authorId,
    authorEmail,
    text: text.trim(),
    createdAt: Timestamp.now(),
    parentId,
  });
  return ref.id;
}

export function subscribeToComments(
  listingId: string,
  onComments: (comments: Comment[]) => void
): Unsubscribe {
  const db = getDb();
  if (!db) {
    onComments([]);
    return () => {};
  }

  const colRef = collection(db, "listings", listingId, COMMENTS_SUBCOLLECTION);
  const q = query(colRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snap) => {
    const comments: Comment[] = [];
    snap.docs.forEach((d) => {
      const data = d.data() as CommentDoc;
      comments.push(docToComment(d.id, listingId, data));
    });
    onComments(comments);
  });
}

export async function deleteComment(
  listingId: string,
  commentId: string
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured.");

  const ref = doc(db, "listings", listingId, COMMENTS_SUBCOLLECTION, commentId);
  await deleteDoc(ref);
}
