/**
 * Script pour appliquer la migration
 * Sauvegarde db.json actuel et applique db-migrated.json
 */

import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "db.json");
const migratedPath = path.join(__dirname, "db-migrated.json");
const backupPath = path.join(__dirname, "db-backup.json");

console.log("🔄 Application de la migration...\n");

// Vérifier que db-migrated.json existe
if (!fs.existsSync(migratedPath)) {
  console.error("❌ Erreur: db-migrated.json n'existe pas");
  console.error("   Exécutez d'abord: node migrate-themes.js");
  process.exit(1);
}

// Sauvegarder db.json actuel
console.log("📦 Sauvegarde de db.json vers db-backup.json...");
fs.copyFileSync(dbPath, backupPath);
console.log("✅ Sauvegarde créée\n");

// Appliquer la migration
console.log("🔄 Application de db-migrated.json...");
fs.copyFileSync(migratedPath, dbPath);
console.log("✅ Migration appliquée\n");

console.log("✅ Migration terminée avec succès !");
console.log("\n📋 Actions effectuées:");
console.log("   - db.json sauvegardé dans db-backup.json");
console.log("   - db-migrated.json appliqué comme nouveau db.json");
console.log("\n⚠️  Pour revenir en arrière: node revert-migration.js");
