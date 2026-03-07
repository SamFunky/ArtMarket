import admin from "firebase-admin";

function getAdminApp(): admin.app.App | null {
  if (admin.apps.length > 0) return admin.app();
  const key = process.env.FIREBASE_PRIVATE_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  if (key && projectId && clientEmail) {
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
    }
  }
  try {
    return admin.initializeApp();
  } catch {
    return null;
  }
}

export function getAdminDb(): admin.firestore.Firestore | null {
  const app = getAdminApp();
  return app ? app.firestore() : null;
}

export function getAdminStorageBucket() {
  const app = getAdminApp();
  if (!app) return null;
  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    process.env.FIREBASE_PROJECT_ID;
  if (!projectId) return null;
  const bucket = app.storage().bucket(`${projectId}.firebasestorage.app`);
  return bucket;
}
