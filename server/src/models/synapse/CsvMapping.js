import mongoose from "mongoose";

import { synapseConn } from "../../config/database.js";

const CsvMappingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    // Séparateur détecté ou choisi : ";" | "," | "\t"
    separator: {
      type: String,
      default: ";",
    },
    // Mapping des colonnes : nom de la colonne CSV → champ applicatif
    colDate: { type: String },
    colDesignation: { type: String },
    // "single" = une colonne montant signé / "double" = deux colonnes débit+crédit
    montantType: {
      type: String,
      enum: ["single", "double"],
      default: "single",
    },
    colMontant: { type: String },
    colDebit: { type: String },
    colCredit: { type: String },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false },
);

export const CsvMapping = synapseConn.model("CsvMapping", CsvMappingSchema);
