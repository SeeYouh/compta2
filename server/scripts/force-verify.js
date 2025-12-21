import "dotenv/config";

import { connectDB } from "../src/config/database.js";
import { User } from "../src/models/User.js";

/**
 * Script pour forcer la vérification d'un utilisateur existant
 */
async function forceVerifyUser() {
  try {
    console.log("🔧 Forçage de la vérification de l'utilisateur\n");

    await connectDB();

    const email = "mandrag16@hotmail.com";

    const result = await User.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          isVerified: true,
          verificationToken: null,
          verificationTokenExpires: null,
        },
      }
    );

    if (result.matchedCount === 0) {
      console.log("❌ Aucun utilisateur trouvé avec cet email");
      process.exit(1);
    }

    console.log(`✅ Utilisateur ${email} vérifié avec succès !`);
    console.log(`   Documents modifiés : ${result.modifiedCount}`);

    // Vérification
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("\n📋 État après mise à jour :");
    console.log(`   isVerified: ${user.isVerified}`);
    console.log(`   verificationToken: ${user.verificationToken}`);
  } catch (error) {
    console.error("\n❌ Erreur:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

forceVerifyUser();
