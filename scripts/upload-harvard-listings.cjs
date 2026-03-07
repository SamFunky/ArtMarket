const { readFile } = require("fs/promises");
const path = require("path");
const admin = require("firebase-admin");

const LOCAL_PATH = path.join(__dirname, "..", "src", "data", "harvard-listings.generated.json");
const STORAGE_PATH = "harvard-listings.json";

async function main() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!key || !projectId || !clientEmail) {
    console.error(
      "Missing env vars. Run with --env-file=.env.local or set FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID"
    );
    process.exit(1);
  }

  const privateKey = key.replace(/\\n/g, "\n");
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });

  const json = await readFile(LOCAL_PATH, "utf-8");
  const bucket = admin.storage().bucket(`${projectId}.appspot.com`);
  await bucket.file(STORAGE_PATH).save(json, { contentType: "application/json" });

  console.log(`Uploaded ${LOCAL_PATH} to gs://${projectId}.appspot.com/${STORAGE_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
