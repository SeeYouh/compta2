import "dotenv/config";

import { connectDB } from "../src/config/database.js";
import { User } from "../src/models/User.js";

/**
 * Script de migration pour marquer tous les utilisateurs existants comme vérifiés
 * À utiliser pour les comptes créés avant l'implémentation de la vérification par email
 */
async function verifyExistingUsers() {
  try {
    console.log("🔄 Migration : Vérification des utilisateurs existants\n");

    await connectDB();

    // Trouver tous les utilisateurs non vérifiés
    const unverifiedUsers = await User.find({ isVerified: false });

    if (unverifiedUsers.length === 0) {
      console.log("✅ Aucun utilisateur non vérifié trouvé");
      process.exit(0);
    }

    console.log(`📋 ${unverifiedUsers.length} utilisateur(s) non vérifié(s) :`);
    unverifiedUsers.forEach((user) => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    // Marquer tous comme vérifiés
    const result = await User.updateMany(
      { isVerified: false },
      {
        $set: {
          isVerified: true,
          verificationToken: null,
          verificationTokenExpires: null,
        },
      }
    );

    console.log(`\n✅ Migration terminée avec succès !`);
    console.log(
      `   ${result.modifiedCount} utilisateur(s) marqué(s) comme vérifié(s)`
    );
  } catch (error) {
    console.error("\n❌ Erreur lors de la migration:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Connexion fermée");
  }
}

verifyExistingUsers();
