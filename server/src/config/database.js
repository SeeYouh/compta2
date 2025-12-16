import mongoose from "mongoose";

import { config } from "../config/index.js";

export async function connectDB() {
  try {
    await mongoose.connect(config.mongodb.uri, {
      dbName: config.mongodb.dbName,
    });
    console.log("✅ MongoDB connecté");
  } catch (error) {
    console.error("❌ Erreur connexion MongoDB:", error.message);
    process.exit(1);
  }
}
