/**
 * Script de migration des thèmes et sous-thèmes
 *
 * Ce script :
 * 1. Lit db.json actuel
 * 2. Extrait tous les thèmes/sous-thèmes uniques
 * 3. Génère des IDs pour chacun
 * 4. Crée themes.json
 * 5. Crée db-migrated.json avec les IDs
 *
 * Usage: node migrate-themes.js
 */

import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour générer un ID à partir d'un nom
function generateId(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Retirer les accents
    .replace(/[^a-z0-9]+/g, "-") // Remplacer caractères spéciaux par -
    .replace(/^-+|-+$/g, ""); // Retirer - au début/fin
}

// Lire db.json
const dbPath = path.join(__dirname, "db.json");
const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

console.log(`📊 Analyse de ${db.transactions.length} transactions...`);

// Extraire tous les thèmes et sous-thèmes
const themesMap = new Map();

db.transactions.forEach((tx) => {
  const themeName = tx.theme || "Non catégorisé";
  const subThemeName = tx.subTheme || "Sans catégorie";

  if (!themesMap.has(themeName)) {
    themesMap.set(themeName, new Set());
  }
  themesMap.get(themeName).add(subThemeName);
});

console.log(`✅ ${themesMap.size} thèmes uniques trouvés`);

// Construire la structure themes.json
const themes = {};
const idMapping = {
  themes: {},
  subThemes: {},
};

let themeCounter = 1;
let subThemeCounter = 1;

for (const [themeName, subThemesSet] of themesMap.entries()) {
  const themeId = `theme-${themeCounter}`;

  // Stocker le mapping
  idMapping.themes[themeName] = themeId;

  // Créer la structure du thème
  themes[themeId] = {
    id: themeId,
    name: themeName,
    slug: generateId(themeName),
    subThemes: {},
  };

  // Ajouter les sous-thèmes
  for (const subThemeName of subThemesSet) {
    const subThemeId = `subtheme-${themeCounter}-${subThemeCounter}`;

    // Stocker le mapping
    const key = `${themeName}|${subThemeName}`;
    idMapping.subThemes[key] = subThemeId;

    themes[themeId].subThemes[subThemeId] = {
      id: subThemeId,
      name: subThemeName,
      slug: generateId(subThemeName),
    };

    subThemeCounter++;
  }

  themeCounter++;
  subThemeCounter = 1;
}

// Sauvegarder themes.json
const themesJson = { themes };
const themesPath = path.join(__dirname, "themes.json");
fs.writeFileSync(themesPath, JSON.stringify(themesJson, null, 2), "utf8");
console.log(`✅ themes.json créé avec ${Object.keys(themes).length} thèmes`);

// Migrer les transactions
console.log(`\n🔄 Migration des transactions vers les IDs...`);

const migratedTransactions = db.transactions.map((tx) => {
  const themeName = tx.theme || "Non catégorisé";
  const subThemeName = tx.subTheme || "Sans catégorie";
  const key = `${themeName}|${subThemeName}`;

  return {
    ...tx,
    themeId: idMapping.themes[themeName],
    subThemeId: idMapping.subThemes[key],
    // Garder les anciens champs pour compatibilité temporaire
    theme_legacy: tx.theme,
    subTheme_legacy: tx.subTheme,
  };
});

// Sauvegarder db-migrated.json
const migratedDb = { transactions: migratedTransactions };
const migratedPath = path.join(__dirname, "db-migrated.json");
fs.writeFileSync(migratedPath, JSON.stringify(migratedDb, null, 2), "utf8");
console.log(
  `✅ db-migrated.json créé avec ${migratedTransactions.length} transactions migrées`
);

// Créer un fichier de rapport
const report = {
  migrationDate: new Date().toISOString(),
  totalTransactions: db.transactions.length,
  totalThemes: Object.keys(themes).length,
  totalSubThemes: Object.values(themes).reduce(
    (sum, theme) => sum + Object.keys(theme.subThemes).length,
    0
  ),
  mapping: idMapping,
};

const reportPath = path.join(__dirname, "migration-report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

console.log(`\n📋 Rapport de migration:`);
console.log(`   - ${report.totalThemes} thèmes`);
console.log(`   - ${report.totalSubThemes} sous-thèmes`);
console.log(`   - ${report.totalTransactions} transactions migrées`);
console.log(`\n✅ Migration terminée !`);
console.log(
  `\n⚠️  IMPORTANT: Vérifiez db-migrated.json avant de remplacer db.json`
);
console.log(
  `   Pour appliquer la migration: mv db.json db-backup.json && mv db-migrated.json db.json`
);
