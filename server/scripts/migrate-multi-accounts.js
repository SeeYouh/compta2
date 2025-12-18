import "dotenv/config";

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

import { Account } from "../src/models/Account.js";
import { connectDB } from "../src/config/database.js";
import { Theme } from "../src/models/Theme.js";
import { Transaction } from "../src/models/Transaction.js";

/**
 * Script de migration pour multi-comptes
 *
 * Étapes:
 * 1. Récupérer tous les thèmes actuels (sans accountId)
 * 2. Créer compte template avec ces thèmes
 * 3. Créer compte par défaut "Compte Principal"
 * 4. Dupliquer thèmes pour le compte par défaut
 * 5. Ajouter accountId à toutes les transactions existantes
 */

async function migrateToMultiAccounts() {
  try {
    console.log("🚀 Démarrage de la migration multi-comptes...\n");

    await connectDB();

    // ============================================================
    // ÉTAPE 1 : Récupérer tous les thèmes actuels
    // ============================================================
    console.log("📋 Étape 1 : Récupération des thèmes existants...");
    const existingThemes = await Theme.find({}).lean();
    console.log(`   ✓ ${existingThemes.length} thèmes récupérés\n`);

    if (existingThemes.length === 0) {
      console.log("⚠️  Aucun thème existant. Migration annulée.");
      process.exit(0);
    }

    // ============================================================
    // ÉTAPE 2 : Créer compte template
    // ============================================================
    console.log("🏗️  Étape 2 : Création du compte template...");

    // Vérifier si le template existe déjà
    let templateAccount = await Account.findOne({ id: "account-template" });

    if (!templateAccount) {
      templateAccount = await Account.create({
        id: "account-template",
        name: "Template",
        isTemplate: true,
      });
      console.log(`   ✓ Compte template créé (id: ${templateAccount.id})\n`);
    } else {
      console.log(`   ℹ️  Compte template existe déjà\n`);
    }

    // ============================================================
    // ÉTAPE 3 : Copier thèmes vers le template (avec accountId)
    // ============================================================
    console.log("📦 Étape 3 : Copie des thèmes vers le template...");

    const templateThemes = [];
    for (const theme of existingThemes) {
      // Si le thème a déjà un accountId, on le saute (déjà migré)
      if (theme.accountId) {
        console.log(`   ⏭️  Thème "${theme.name}" déjà migré, skip`);
        continue;
      }

      const templateTheme = {
        id: `${theme.id}-template`,
        accountId: templateAccount.id,
        name: theme.name,
        slug: theme.slug,
        subThemes: theme.subThemes || {},
      };

      templateThemes.push(templateTheme);
    }

    if (templateThemes.length > 0) {
      await Theme.insertMany(templateThemes);
      console.log(
        `   ✓ ${templateThemes.length} thèmes copiés vers le template\n`
      );
    } else {
      console.log(`   ℹ️  Aucun thème à copier (déjà migrés)\n`);
    }

    // ============================================================
    // ÉTAPE 4 : Créer compte par défaut "Compte Principal"
    // ============================================================
    console.log("🏦 Étape 4 : Création du compte par défaut...");

    let defaultAccount = await Account.findOne({
      isTemplate: false,
    });

    if (!defaultAccount) {
      defaultAccount = await Account.create({
        id: `account-${uuidv4()}`,
        name: "Compte Principal",
        isTemplate: false,
      });
      console.log(`   ✓ Compte par défaut créé (id: ${defaultAccount.id})\n`);
    } else {
      console.log(
        `   ℹ️  Un compte utilisateur existe déjà (${defaultAccount.name})\n`
      );
    }

    // ============================================================
    // ÉTAPE 5 : Dupliquer thèmes pour le compte par défaut
    // ============================================================
    console.log(
      "🎨 Étape 5 : Duplication des thèmes pour le compte par défaut..."
    );

    const defaultAccountThemes = [];
    for (const theme of existingThemes) {
      // Si le thème a déjà un accountId, c'est qu'on l'a déjà migré
      if (theme.accountId) continue;

      const defaultTheme = {
        id: theme.id, // Garde l'ID original pour les transactions existantes
        accountId: defaultAccount.id,
        name: theme.name,
        slug: theme.slug,
        subThemes: theme.subThemes || {},
      };

      defaultAccountThemes.push(defaultTheme);
    }

    if (defaultAccountThemes.length > 0) {
      // Supprimer les anciens thèmes sans accountId
      await Theme.deleteMany({ accountId: { $exists: false } });
      console.log(`   ✓ Anciens thèmes supprimés`);

      // Insérer les nouveaux avec accountId
      await Theme.insertMany(defaultAccountThemes);
      console.log(
        `   ✓ ${defaultAccountThemes.length} thèmes créés pour le compte par défaut\n`
      );
    } else {
      console.log(`   ℹ️  Thèmes déjà migrés\n`);
    }

    // ============================================================
    // ÉTAPE 6 : Ajouter accountId aux transactions existantes
    // ============================================================
    console.log("💳 Étape 6 : Migration des transactions existantes...");

    const transactionsWithoutAccount = await Transaction.countDocuments({
      accountId: { $exists: false },
    });

    if (transactionsWithoutAccount > 0) {
      await Transaction.updateMany(
        { accountId: { $exists: false } },
        { $set: { accountId: defaultAccount.id } }
      );
      console.log(
        `   ✓ ${transactionsWithoutAccount} transactions migrées vers le compte par défaut\n`
      );
    } else {
      console.log(`   ℹ️  Aucune transaction à migrer\n`);
    }

    // ============================================================
    // RÉSUMÉ
    // ============================================================
    console.log("✅ Migration terminée avec succès !\n");
    console.log("📊 Résumé:");
    console.log(`   - Compte template: ${templateAccount.id}`);
    console.log(`   - Thèmes template: ${templateThemes.length}`);
    console.log(
      `   - Compte par défaut: ${defaultAccount.name} (${defaultAccount.id})`
    );
    console.log(`   - Thèmes migrés: ${defaultAccountThemes.length}`);
    console.log(`   - Transactions migrées: ${transactionsWithoutAccount}`);
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Connexion fermée");
  }
}

// Exécuter la migration
migrateToMultiAccounts();
