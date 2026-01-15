import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    periodFilter: {
      type: String,
      enum: ["all", "6weeks", "2months", "3months", "currentMonth", "previousMonth", "currentYear"],
      default: "all",
    },
  },
  {
    timestamps: true,
  }
);

// Index composé pour éviter les doublons par utilisateur et id
SettingsSchema.index({ userId: 1, id: 1 }, { unique: true });

const Settings = mongoose.model("Settings", SettingsSchema);

export default Settings;
