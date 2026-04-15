import mongoose from "mongoose";

import { config } from "../config/index.js";

export async function connectDB() {
  try {
    await mongoose.connect(config.mongodb.uri, {
      dbName: config.mongodb.dbName,
    });
    console.log("✅ MongoDB connecté");

    // Supprimer l'index id_1 (unique seul) s'il existe encore,
    // remplacé par l'index composé (userId + id).
    try {
      const db = mongoose.connection.db;
      const indexes = await db.collection("settings").indexes();
      if (indexes.some((i) => i.name === "id_1")) {
        await db.collection("settings").dropIndex("id_1");
        console.log("✅ Index settings.id_1 supprimé");
      }
    } catch {
      // Index inexistant ou déjà supprimé, on ignore
    }
  } catch (error) {
    console.error("❌ Erreur connexion MongoDB:", error.message);
    process.exit(1);
  }
}
