import "dotenv/config";

import { connectDB } from "../src/config/database.js";
import { User } from "../src/models/User.js";

async function checkUser() {
  try {
    await connectDB();

    const email = "mandrag16@hotmail.com";
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ Aucun utilisateur trouvé avec l'email ${email}`);
      process.exit(1);
    }

    console.log("\n📋 État de l'utilisateur:");
    console.log(`Email: ${user.email}`);
    console.log(`Nom: ${user.name}`);
    console.log(`isVerified: ${user.isVerified}`);
    console.log(`verificationToken: ${user.verificationToken || "null"}`);
    console.log(
      `verificationTokenExpires: ${user.verificationTokenExpires || "null"}`
    );

    if (!user.isVerified) {
      console.log("\n⚠️  L'utilisateur n'est PAS vérifié");
    } else {
      console.log("\n✅ L'utilisateur EST vérifié");
    }
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    process.exit(0);
  }
}

checkUser();
