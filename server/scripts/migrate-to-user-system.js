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
 * Script de migration pour assigner les données existantes à un utilisateur
 */
async function migrateToUserSystem() {
  try {
    console.log("🔄 Migration vers le système multi-utilisateurs\n");

    await connectDB();

    // Vérifier s'il existe déjà des comptes avec userId
    const accountsWithUser = await Account.countDocuments({
      userId: { $ne: null },
      isTemplate: false,
    });

    if (accountsWithUser > 0) {
      console.log(
        `⚠️  ${accountsWithUser} comptes ont déjà un userId assigné.\n`
      );
      const proceed = await question(
        "Voulez-vous continuer ? Cela pourrait écraser les données. (o/n): "
      );
      if (proceed.toLowerCase() !== "o") {
        console.log("❌ Migration annulée");
        rl.close();
        process.exit(0);
      }
    }

    // Compter les comptes existants (hors template)
    const existingAccounts = await Account.countDocuments({
      isTemplate: false,
    });

    console.log(`📋 ${existingAccounts} comptes existants trouvés\n`);

    if (existingAccounts === 0) {
      console.log("✅ Aucune donnée à migrer");
      rl.close();
      process.exit(0);
    }

    console.log(
      "Pour migrer vos données, vous devez créer votre compte utilisateur.\n"
    );

    // Demander les informations de l'utilisateur
    const email = await question("Email: ");
    const name = await question("Nom/Pseudo: ");
    const password = await question("Mot de passe (min 6 caractères): ");

    if (!email || !name || !password || password.length < 6) {
      console.log(
        "\n❌ Informations invalides. Email, nom et mot de passe (6 car min) requis."
      );
      rl.close();
      process.exit(1);
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    let user;

    if (existingUser) {
      console.log(`\n✅ Utilisateur existant trouvé: ${existingUser.name}`);
      user = existingUser;
    } else {
      // Créer l'utilisateur
      user = await User.create({
        email: email.toLowerCase(),
        password,
        name,
      });
      console.log(`\n✅ Utilisateur créé: ${user.name} (${user.email})`);
    }

    // Assigner tous les comptes existants à cet utilisateur
    const result = await Account.updateMany(
      { isTemplate: false },
      {
        $set: {
          userId: user.id,
          sharedWith: [],
        },
      }
    );

    console.log(`\n✅ ${result.modifiedCount} comptes assignés à ${user.name}`);
    console.log("\n📊 Résumé:");
    console.log(`   - Utilisateur: ${user.name} (${user.email})`);
    console.log(`   - User ID: ${user.id}`);
    console.log(`   - Comptes migrés: ${result.modifiedCount}`);
    console.log("\n✅ Migration terminée avec succès !");
    console.log("\nVous pouvez maintenant vous connecter avec:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Mot de passe: <votre mot de passe>\n`);
  } catch (error) {
    console.error("\n❌ Erreur lors de la migration:", error);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log("🔌 Connexion fermée");
  }
}

migrateToUserSystem();
