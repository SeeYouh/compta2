import mongoose from "mongoose";

import { config } from "../config/index.js";

// Connexions créées immédiatement — les modèles peuvent s'y enregistrer avant ready
export const usersConn = mongoose.createConnection(config.mongodbUsers.uri, {
  dbName: config.mongodbUsers.dbName,
});

export const synapseConn = mongoose.createConnection(
  config.mongodbSynapse.uri,
  { dbName: config.mongodbSynapse.dbName },
);

export const trameConn = mongoose.createConnection(config.mongodbTrame.uri, {
  dbName: config.mongodbTrame.dbName,
});

export const odysseeConn = mongoose.createConnection(
  config.mongodbOdyssee.uri,
  { dbName: config.mongodbOdyssee.dbName },
);

export async function connectDB() {
  try {
    await Promise.all([
      usersConn.asPromise(),
      synapseConn.asPromise(),
      trameConn.asPromise(),
      odysseeConn.asPromise(),
    ]);
    console.log("✅ MongoDB connecté (4 bases)");

    // Supprimer l'index id_1 (unique seul) s'il existe encore dans Synapse,
    // remplacé par l'index composé (userId + id).
    try {
      const db = synapseConn.db;
      const indexes = await db.collection("settings").indexes();
      if (indexes.some((i) => i.name === "id_1")) {
        await db.collection("settings").dropIndex("id_1");
        console.log("✅ Index settings.id_1 supprimé");
      }
    } catch {
      // Index inexistant ou déjà supprimé, on ignore
    }

    // Supprimer l'ancien index userId_1 (unique sur userId seul) de odysseesidebarlayouts,
    // remplacé par l'index composé (userId + type).
    try {
      const db = odysseeConn.db;
      const indexes = await db.collection("odysseesidebarlayouts").indexes();
      if (indexes.some((i) => i.name === "userId_1")) {
        await db.collection("odysseesidebarlayouts").dropIndex("userId_1");
        console.log("✅ Index odysseesidebarlayouts.userId_1 supprimé");
      }
    } catch {
      // Index inexistant ou déjà supprimé, on ignore
    }
  } catch (error) {
    console.error("❌ Erreur connexion MongoDB:", error.message);
    process.exit(1);
  }
}
