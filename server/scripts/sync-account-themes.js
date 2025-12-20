import { dirname, resolve } from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import { Account } from "../src/models/Account.js";
import { Theme } from "../src/models/Theme.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });

const TRANSFER_THEME_ID = "theme-compte-transfer";

async function sync() {
  try {
    const mongoUri = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_ADDRESS}`;
    await mongoose.connect(mongoUri);
    console.log("✅ Connecté\n");

    // Récupérer tous les comptes (pas seulement isTemplate: false)
    const allAccounts = await Account.find({});
    console.log(`📊 Total: ${allAccounts.length} compte(s)`);

    // Filtrer manuellement pour exclure le template
    const accounts = allAccounts.filter((acc) => acc.isTemplate !== true);
    console.log(`📊 Non-template: ${accounts.length} compte(s)\n`);

    if (accounts.length <= 1) {
      await Theme.deleteMany({ id: TRANSFER_THEME_ID });
      console.log(
        "❌ Pas assez de comptes (besoin de 2+), thème Compte supprimé\n"
      );
      return;
    }

    for (const account of accounts) {
      const otherAccounts = accounts
        .filter((acc) => acc.id !== account.id)
        .sort((a, b) => a.name.localeCompare(b.name, "fr"));

      const subThemes = new Map(
        otherAccounts.map((acc) => [
          acc.id,
          {
            id: acc.id,
            name: acc.name,
            slug: acc.name.toLowerCase().replace(/\s+/g, "-"),
            linkedAccountId: acc.id,
            linkedThemeId: null,
            linkedSubThemeId: null,
          },
        ])
      );

      const existingTheme = await Theme.findOne({
        id: TRANSFER_THEME_ID,
        accountId: account.id,
      });

      if (existingTheme) {
        existingTheme.subThemes = subThemes;
        await existingTheme.save();
        console.log(`✏️  Mis à jour: ${account.name}`);
      } else {
        await Theme.create({
          id: TRANSFER_THEME_ID,
          accountId: account.id,
          name: "Compte",
          slug: "compte",
          subThemes,
        });
        console.log(`➕ Créé: ${account.name}`);
      }
    }

    console.log("\n✅ Terminé !");
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.disconnect();
  }
}

sync();
