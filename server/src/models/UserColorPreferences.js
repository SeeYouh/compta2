import mongoose from "mongoose";

import { synapseConn } from "../config/database.js";

const MAX_HISTORY = 30;

const UserColorPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    // Historique des couleurs utilisées — partagé entre tous les contextes
    history: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= MAX_HISTORY,
        message: `L'historique ne peut pas dépasser ${MAX_HISTORY} couleurs.`,
      },
    },
    // Variables CSS à persister — clé = nom de la variable, valeur = hex
    variables: {
      type: Map,
      of: String,
      default: {},
    },
    // Couleur par défaut par contextKey — définie par l'utilisateur
    defaults: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

const UserColorPreferences = synapseConn.model(
  "UserColorPreferences",
  UserColorPreferencesSchema,
);

export default UserColorPreferences;
