import "dotenv/config";

import mongoose from "mongoose";
import readline from "readline";

import { Account } from "../src/models/Account.js";
import { connectDB } from "../src/config/database.js";
import { User } from "../src/models/User.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

/**
 * Script de migration pour associer les données existantes à un utilisateur
 * À exécuter APRÈS avoir créé votre premier compte utilisateur
 */
async function migrateToUser() {
  try {
    console.log("🔄 Migration des données existantes vers un utilisateur\n");

    await connectDB();

    // Vérifier s'il y a des comptes non assignés
    const unassignedAccounts = await Account.find({
      userId: null,
      isTemplate: false,
    });

    if (unassignedAccounts.length === 0) {
      console.log(
        "✅ Aucun compte à migrer (tous les comptes sont déjà assignés)"
      );
      process.exit(0);
    }

    console.log(
      `📋 ${unassignedAccounts.length} compte(s) non assigné(s) trouvé(s):`
    );
    unassignedAccounts.forEach((acc) => {
      console.log(`   - ${acc.name} (${acc.id})`);
    });

    // Demander l'email de l'utilisateur
    const email = await question(
      "\n📧 Entrez l'email de votre compte utilisateur : "
    );

    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      console.log("\n❌ Aucun utilisateur trouvé avec cet email.");
      console.log(
        "   Assurez-vous d'avoir créé votre compte via /api/auth/register d'abord."
      );
      process.exit(1);
    }

    console.log(`\n👤 Utilisateur trouvé : ${user.name} (${user.email})`);

    // Demander confirmation
    const confirm = await question(
      `\n⚠️  Voulez-vous assigner les ${unassignedAccounts.length} compte(s) à cet utilisateur ? (oui/non) : `
    );

    if (confirm.trim().toLowerCase() !== "oui") {
      console.log("\n❌ Migration annulée");
      process.exit(0);
    }

    // Assigner les comptes à l'utilisateur
    const result = await Account.updateMany(
      { userId: null, isTemplate: false },
      { $set: { userId: user.id, sharedWith: [] } }
    );

    console.log(`\n✅ Migration terminée avec succès !`);
    console.log(
      `   ${result.modifiedCount} compte(s) assigné(s) à ${user.name}`
    );
  } catch (error) {
    console.error("\n❌ Erreur lors de la migration:", error);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log("\n🔌 Connexion fermée");
  }
}

migrateToUser();
