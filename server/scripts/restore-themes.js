import "dotenv/config";

import { fileURLToPath } from "url";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";

import { Account } from "../src/models/Account.js";
import { connectDB } from "../src/config/database.js";
import { Theme } from "../src/models/Theme.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de restauration des thèmes depuis themes.json
 * Crée un compte template et restaure les thèmes pour le Compte Principal
 */
async function restoreThemes() {
  try {
    console.log("🔄 Restauration des thèmes...\n");

    await connectDB();

    // Lire le fichier themes.json
    const themesFile = path.join(__dirname, "../../client/themes.json");
    const themesData = JSON.parse(fs.readFileSync(themesFile, "utf-8"));
    const baseThemes = themesData.themes;

    console.log(`📋 ${Object.keys(baseThemes).length} thèmes à restaurer\n`);

    // Supprimer tous les thèmes existants
    await Theme.deleteMany({});
    console.log("🗑️  Anciens thèmes supprimés\n");

    // Créer ou récupérer le compte template
    let templateAccount = await Account.findOne({ isTemplate: true });
    if (!templateAccount) {
      templateAccount = await Account.create({
        id: `account-template`,
        name: "Template",
        isTemplate: true,
      });
      console.log("📝 Compte template créé\n");
    } else {
      console.log("📝 Compte template existant trouvé\n");
    }

    // Récupérer le Compte Principal
    const comptePrincipal = await Account.findOne({
      name: "Compte Principal",
      isTemplate: false,
    });

    if (!comptePrincipal) {
      console.log("⚠️  Compte Principal introuvable. Impossible de restaurer.");
      process.exit(1);
    }

    console.log(`🏦 Compte Principal trouvé: ${comptePrincipal.id}\n`);

    // Créer les thèmes pour le template ET le Compte Principal
    const themesToInsert = [];

    for (const accountToPopulate of [templateAccount, comptePrincipal]) {
      console.log(`📦 Création des thèmes pour "${accountToPopulate.name}"...`);

      for (const [themeId, theme] of Object.entries(baseThemes)) {
        const subThemes = {};
        for (const [subThemeId, subTheme] of Object.entries(
          theme.subThemes || {}
        )) {
          subThemes[subThemeId] = {
            ...subTheme,
            linkedAccountId: null,
            linkedThemeId: null,
            linkedSubThemeId: null,
          };
        }

        themesToInsert.push({
          id: themeId,
          accountId: accountToPopulate.id,
          name: theme.name,
          slug: theme.slug,
          subThemes: subThemes,
        });
      }

      console.log(`   ✓ ${Object.keys(baseThemes).length} thèmes créés\n`);
    }

    // Insérer tous les thèmes
    await Theme.insertMany(themesToInsert);

    console.log("✅ Restauration terminée avec succès !\n");
    console.log("📊 Résumé:");
    console.log(`   - Compte template: ${templateAccount.id}`);
    console.log(`   - Compte Principal: ${comptePrincipal.id}`);
    console.log(`   - Thèmes par compte: ${Object.keys(baseThemes).length}`);
    console.log(`   - Total thèmes créés: ${themesToInsert.length}`);
  } catch (error) {
    console.error("❌ Erreur lors de la restauration:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Connexion fermée");
  }
}

restoreThemes();
