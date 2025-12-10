import { fileURLToPath } from 'url';
// Script pour ajouter le champ "disabled" à toutes les transactions existantes
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "db.json");

// Lire le fichier JSON
const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

// Ajouter le champ "disabled" à chaque transaction si elle ne l'a pas déjà
if (data.transactions) {
  data.transactions = data.transactions.map((transaction) => {
    if (!transaction.hasOwnProperty("disabled")) {
      return { ...transaction, disabled: false };
    }
    return transaction;
  });
}

// Sauvegarder le fichier JSON mis à jour
fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");

console.log("✅ Base de données mise à jour avec succès !");
console.log(`📊 ${data.transactions.length} transactions ont été traitées.`);
