/**
 * Supprime l'index id_1 incorrect sur la collection settings.
 * Cet index empêchait plusieurs utilisateurs d'avoir le même id de settings (ex: "user-preferences").
 * L'index correct (userId + id) est conservé.
 *
 * Utilisation : node scripts/fix-settings-index.js
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

// Charger le .env depuis server/
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
const envVars = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      const key = l.slice(0, idx).trim();
      const val = l.slice(idx + 1).trim().replace(/^"|"$/g, "");
      return [key, val];
    }),
);

const uri = `mongodb://${envVars.MONGODB_USER}:${envVars.MONGODB_PASSWORD}@${envVars.MONGODB_ADDRESS}/${envVars.MONGODB_DATABASE}`;

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const collection = db.collection("settings");

  const indexes = await collection.indexes();
  console.log("Index actuels :", indexes.map((i) => i.name));

  if (indexes.some((i) => i.name === "id_1")) {
    await collection.dropIndex("id_1");
    console.log("✅ Index id_1 supprimé.");
  } else {
    console.log("ℹ️  Index id_1 inexistant, rien à faire.");
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Erreur :", err);
  process.exit(1);
});
