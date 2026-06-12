import mongoose from "mongoose";

import { synapseConn } from "../../config/database.js";

const SettingsSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    periodFilter: {
      type: String,
      enum: [
        "all",
        "6weeks",
        "2months",
        "3months",
        "currentMonth",
        "previousMonth",
        "currentYear",
      ],
      default: "all",
    },
    userColor: {
      type: String,
      default: "#969696",
      match: /^#[0-9A-Fa-f]{6}$/,
    },
  },
  {
    timestamps: true,
  },
);

// Index composé pour éviter les doublons par utilisateur et id
SettingsSchema.index({ userId: 1, id: 1 }, { unique: true });

const Settings = synapseConn.model("Settings", SettingsSchema);

export default Settings;
