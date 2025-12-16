import fs from "fs";

const themes = JSON.parse(fs.readFileSync("./themes.json", "utf-8"));
const db = JSON.parse(fs.readFileSync("./db.json", "utf-8"));

console.log("=== THEMES DISPONIBLES ===");
Object.values(themes.themes).forEach((theme) => {
  console.log(`${theme.id}: ${theme.name}`);
  Object.values(theme.subThemes).forEach((sub) => {
    console.log(`  ${sub.id}: ${sub.name}`);
  });
});

console.log("\n=== VERIFICATION DES 10 PREMIERES TRANSACTIONS ===");
db.transactions.slice(0, 10).forEach((t) => {
  const theme = themes.themes[t.themeId];
  const subTheme = theme?.subThemes[t.subThemeId];
  const ok = theme && subTheme;
  console.log(
    `ID:${t.id} | themeId:${t.themeId} | subThemeId:${t.subThemeId} | ${
      ok ? "✓" : "✗ ERREUR"
    }`
  );
  if (!ok) {
    console.log(`  Attendu: ${t.theme} / ${t.subTheme}`);
  }
});

console.log("\n=== RECHERCHE ERREURS DANS TOUTES LES TRANSACTIONS ===");
let errors = 0;
db.transactions.forEach((t) => {
  const theme = themes.themes[t.themeId];
  const subTheme = theme?.subThemes[t.subThemeId];
  if (!theme || !subTheme) {
    errors++;
    console.log(
      `Transaction ${t.id}: themeId=${t.themeId}, subThemeId=${t.subThemeId} - INVALIDE`
    );
    console.log(`  theme: ${t.theme}, subTheme: ${t.subTheme}`);
  }
});
console.log(`\nTotal erreurs: ${errors}/${db.transactions.length}`);
