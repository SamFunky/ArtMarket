import admin from "firebase-admin";

function getAdminApp(): admin.app.App | null {
  if (admin.apps.length > 0) return admin.app();
  const key = process.env.FIREBASE_PRIVATE_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  if (!key || !projectId || !clientEmail) return null;
  try {
    const privateKey = key.replace(/\\n/g, "\n");
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch {
    return null;
  }
}

export function getAdminDb(): admin.firestore.Firestore | null {
  const app = getAdminApp();
  return app ? app.firestore() : null;
}
