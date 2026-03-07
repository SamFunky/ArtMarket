import admin from "firebase-admin";

function resolveProjectId(): string | null {
  return (
    process.env.GOOGLE_CLOUD_PROJECT ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    process.env.FIREBASE_PROJECT_ID ??
    null
  );
}

function getAdminApp(): admin.app.App | null {
  if (admin.apps.length > 0) return admin.app();
  const projectId = resolveProjectId();
  const key = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  if (key && projectId && clientEmail) {
    try {
      const privateKey = key.replace(/\\n/g, "\n");
      return admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        storageBucket: `${projectId}.firebasestorage.app`,
      });
    } catch {
    }
  }
  try {
    const appConfig: admin.AppOptions = {};
    if (projectId) appConfig.storageBucket = `${projectId}.firebasestorage.app`;
    return admin.initializeApp(appConfig);
  } catch {
    return null;
  }
}

export function getAdminDb(): admin.firestore.Firestore | null {
  const app = getAdminApp();
  return app ? app.firestore() : null;
}

export function getAdminStorageBucket(bucketSuffix: "firebasestorage.app" | "appspot.com" = "firebasestorage.app") {
  const app = getAdminApp();
  if (!app) return null;
  const projectId = resolveProjectId();
  if (!projectId) return null;
  try {
    return app.storage().bucket(`${projectId}.${bucketSuffix}`);
  } catch {
    return null;
  }
}
