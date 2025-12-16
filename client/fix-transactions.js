import fs from "fs";

const themes = JSON.parse(fs.readFileSync("./themes.json", "utf-8"));
const db = JSON.parse(fs.readFileSync("./db.json", "utf-8"));

console.log("=== REPARATION DES TRANSACTIONS ===\n");

// Créer un mapping pour trouver les IDs à partir des noms
const themeMapping = {};
Object.values(themes.themes).forEach((theme) => {
  themeMapping[theme.name] = {
    id: theme.id,
    subThemes: {},
  };
  Object.values(theme.subThemes).forEach((sub) => {
    themeMapping[theme.name].subThemes[sub.name] = sub.id;
  });
});

let fixed = 0;
let errors = 0;

db.transactions.forEach((transaction) => {
  const needsFix = !transaction.themeId || !transaction.subThemeId;

  if (needsFix) {
    const themeName = transaction.theme;
    const subThemeName = transaction.subTheme;

    if (themeName && subThemeName && themeMapping[themeName]) {
      const themeData = themeMapping[themeName];
      const themeId = themeData.id;
      const subThemeId = themeData.subThemes[subThemeName];

      if (themeId && subThemeId) {
        transaction.themeId = themeId;
        transaction.subThemeId = subThemeId;
        console.log(
          `✓ Transaction ${transaction.id}: ${themeName} → ${themeId}, ${subThemeName} → ${subThemeId}`
        );
        fixed++;
      } else {
        console.log(
          `✗ Transaction ${transaction.id}: Impossible de mapper "${themeName}" / "${subThemeName}"`
        );
        errors++;
      }
    } else {
      console.log(
        `✗ Transaction ${transaction.id}: Thème ou sous-thème manquant`
      );
      errors++;
    }
  }
});

// Vérification finale
console.log("\n=== VERIFICATION FINALE ===");
let stillBroken = 0;
db.transactions.forEach((t) => {
  const theme = themes.themes[t.themeId];
  const subTheme = theme?.subThemes[t.subThemeId];
  if (!theme || !subTheme) {
    stillBroken++;
  }
});

console.log(`\nTransactions réparées: ${fixed}`);
console.log(`Erreurs: ${errors}`);
console.log(`Transactions encore invalides: ${stillBroken}`);

if (stillBroken === 0) {
  // Sauvegarder le fichier réparé
  fs.writeFileSync("./db.json", JSON.stringify(db, null, 2), "utf-8");
  console.log("\n✅ Fichier db.json mis à jour avec succès !");
} else {
  console.log("\n⚠️  Fichier non sauvegardé car il reste des erreurs");
}
