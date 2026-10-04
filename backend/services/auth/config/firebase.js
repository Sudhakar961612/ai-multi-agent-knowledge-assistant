import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { cert, initializeApp } from "firebase-admin";

dotenv.config();

const credentialVariables = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY"
];
const availableCredentialVariables = credentialVariables.filter((name) => process.env[name]);

let credential;

if (availableCredentialVariables.length === credentialVariables.length) {
  credential = cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  });
} else if (availableCredentialVariables.length > 0) {
  const missingVariables = credentialVariables.filter((name) => !process.env[name]);
  throw new Error(
    `Firebase Admin credentials are incomplete. Set: ${missingVariables.join(", ")}`
  );
} else if (process.env.NODE_ENV === "production") {
  throw new Error(
    `Firebase Admin credentials must be set in production: ${credentialVariables.join(", ")}`
  );
} else {
  const serviceAccountPath = fileURLToPath(
    new URL("../serviceAccountKey.json", import.meta.url)
  );

  if (!existsSync(serviceAccountPath)) {
    throw new Error(
      `Firebase Admin credentials are missing. Set ${credentialVariables.join(", ")} or provide the local serviceAccountKey.json file.`
    );
  }

  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  credential = cert(serviceAccount);
}

export const app = initializeApp({ credential });