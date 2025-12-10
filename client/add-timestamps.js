import {
  dirname,
  join,
} from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, "db.json");

// Lire le fichier db.json
const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));

console.log(`📊 Nombre de transactions trouvées: ${data.transactions.length}`);

let updatedCount = 0;

// Ajouter createdAt et updatedAt à chaque transaction qui n'en a pas
data.transactions = data.transactions.map((transaction) => {
  let modified = false;

  // Si createdAt n'existe pas, on l'ajoute
  if (!transaction.createdAt) {
    // On utilise l'ID comme timestamp de création (si c'est un nombre)
    // Sinon, on met une date ancienne par défaut
    if (typeof transaction.id === "number") {
      transaction.createdAt = transaction.id;
    } else {
      // Date par défaut : 1er janvier 2024
      transaction.createdAt = new Date("2024-01-01").getTime();
    }
    modified = true;
  }

  // Si updatedAt n'existe pas, on le met égal à createdAt
  if (!transaction.updatedAt) {
    transaction.updatedAt = transaction.createdAt;
    modified = true;
  }

  if (modified) {
    updatedCount++;
  }

  return transaction;
});

// Sauvegarder le fichier
fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");

console.log(`✅ Migration terminée !`);
console.log(`   ${updatedCount} transactions mises à jour`);
console.log(
  `   ${data.transactions.length - updatedCount} transactions déjà à jour`
);
