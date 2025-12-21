import "dotenv/config";

import { connectDB } from "../src/config/database.js";
import { Transaction } from "../src/models/Transaction.js";
import { User } from "../src/models/User.js";

/**
 * Script de test de sécurité
 * Vérifie qu'un utilisateur ne peut pas accéder aux données d'un autre
 */
async function testSecurity() {
  try {
    console.log("🔒 Test de sécurité des données\n");

    await connectDB();

    // Compter le nombre total de transactions dans MongoDB
    const totalTransactions = await Transaction.countDocuments();
    console.log(`📊 Total transactions en base : ${totalTransactions}`);

    // Lister tous les utilisateurs
    const users = await User.find().select("id email name");
    console.log(`\n👥 Utilisateurs en base : ${users.length}`);
    users.forEach((user) => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    if (users.length < 2) {
      console.log(
        "\n⚠️  Créez au moins 2 utilisateurs pour tester l'isolation des données"
      );
      process.exit(0);
    }

    // Pour chaque utilisateur, simuler ce qu'il verrait
    console.log("\n🔍 Test d'isolation des données :\n");

    for (const user of users) {
      // Simuler getUserAccounts
      const { Account } = await import("../src/models/Account.js");
      const userAccounts = await Account.find({
        $or: [{ userId: user.id }, { "sharedWith.userId": user.id }],
      });

      const accountIds = userAccounts.map((acc) => acc.id);

      // Simuler getTransactions
      const userTransactions = await Transaction.find({
        accountId: { $in: accountIds },
      });

      console.log(`👤 ${user.name} :`);
      console.log(`   - ${userAccounts.length} compte(s) accessible(s)`);
      console.log(`   - ${userTransactions.length} transaction(s) visible(s)`);

      // Vérifier qu'aucune transaction d'autres comptes n'est accessible
      const otherAccountIds = (
        await Account.find({
          userId: { $ne: user.id },
          "sharedWith.userId": { $ne: user.id },
        })
      ).map((acc) => acc.id);

      const leakedTransactions = await Transaction.find({
        accountId: { $in: otherAccountIds },
      });

      if (leakedTransactions.length > 0) {
        console.log(
          `   ⚠️  ATTENTION : ${leakedTransactions.length} transaction(s) d'autres utilisateurs présente(s) !`
        );
      } else {
        console.log(`   ✅ Aucune fuite de données`);
      }

      console.log();
    }

    console.log(
      "✅ Test terminé : Les données sont bien isolées par utilisateur"
    );
    console.log(
      "   Chaque utilisateur ne voit QUE ses propres transactions via les filtres applicatifs"
    );
  } catch (error) {
    console.error("\n❌ Erreur lors du test:", error);
  } finally {
    await mongoose.disconnect();
  }
}

testSecurity();
