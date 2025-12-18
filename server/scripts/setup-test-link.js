import "dotenv/config";

import mongoose from "mongoose";

import { connectDB } from "../src/config/database.js";
import { Theme } from "../src/models/Theme.js";

/**
 * Script pour configurer un lien de test entre deux comptes
 */
async function setupTestLink() {
  try {
    await connectDB();

    console.log("🔗 Configuration du lien de test...\n");

    // Modifier le sous-thème "Compte joint (Boursorama)" du Compte Principal
    // pour qu'il pointe vers le thème "Revenus" > "Salaire" du Compte Joint
    const result = await Theme.updateOne(
      {
        id: "theme-10",
        accountId: "account-9d5629c9-ecaa-4d04-bf9f-6c89974d0f4e",
      },
      {
        $set: {
          "subThemes.subtheme-10-1.linkedAccountId":
            "account-fc09842c-9665-4a2f-b13e-062c2ea3c708",
          "subThemes.subtheme-10-1.linkedThemeId":
            "theme-8-account-fc09842c-9665-4a2f-b13e-062c2ea3c708",
          "subThemes.subtheme-10-1.linkedSubThemeId": "subtheme-8-1",
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        "✅ Lien configuré : Compte Principal > Famille > Compte joint → Compte Joint > Revenus > Salaire\n"
      );
    } else {
      console.log("⚠️  Aucune modification apportée\n");
    }

    // Vérifier la modification
    const theme = await Theme.findOne({
      id: "theme-10",
      accountId: "account-9d5629c9-ecaa-4d04-bf9f-6c89974d0f4e",
    });

    const subTheme = theme.subThemes.get("subtheme-10-1");
    console.log("📋 Sous-thème modifié :");
    console.log(`   - Nom: ${subTheme.name}`);
    console.log(`   - linkedAccountId: ${subTheme.linkedAccountId}`);
    console.log(`   - linkedThemeId: ${subTheme.linkedThemeId}`);
    console.log(`   - linkedSubThemeId: ${subTheme.linkedSubThemeId}`);
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Connexion fermée");
  }
}

setupTestLink();
