/**
 * Script pour annuler la migration
 * Restaure db-backup.json vers db.json
 */

import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "db.json");
const backupPath = path.join(__dirname, "db-backup.json");

console.log("🔄 Annulation de la migration...\n");

// Vérifier que db-backup.json existe
if (!fs.existsSync(backupPath)) {
  console.error("❌ Erreur: db-backup.json n'existe pas");
  console.error("   Aucune sauvegarde trouvée à restaurer");
  process.exit(1);
}

// Restaurer la sauvegarde
console.log("📦 Restauration de db-backup.json vers db.json...");
fs.copyFileSync(backupPath, dbPath);
console.log("✅ Restauration effectuée\n");

console.log("✅ Migration annulée avec succès !");
console.log("   db.json a été restauré à son état précédent");
