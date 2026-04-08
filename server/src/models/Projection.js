import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

/**
 * Un pattern récurrent détecté par l'algo.
 * Une entrée = une récurrence unique (ex: "Samsic Intérim" chaque mois).
 * Les occurrences générées sont dans ProjectionOccurrence.
 */
const ProjectionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => `proj-${uuidv4()}`,
    },
    accountId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    // Désignation normalisée du pattern (première occurrence de référence)
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    // Jour du mois (1-31) sur lequel tombe récurrentiellement ce mouvement
    dayOfMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },
    // Si récurrence annuelle : mois de l'année (0-11), null si mensuelle
    annualMonth: {
      type: Number,
      default: null,
      min: 0,
      max: 11,
    },
    // Type de récurrence détectée
    frequency: {
      type: String,
      enum: ["monthly", "annual"],
      required: true,
    },
    recette: {
      type: Number,
      default: null,
    },
    depense: {
      type: Number,
      default: null,
    },
    themeId: {
      type: String,
      required: true,
    },
    subThemeId: {
      type: String,
      required: true,
    },
    payment: {
      type: String,
      required: true,
    },
    // Horizon de projection calculé (en mois)
    horizonMonths: {
      type: Number,
      enum: [3, 6, 12, 24, 60, 120],
      default: 12,
    },
    // Date jusqu'où les occurrences ont été calculées (ISO)
    calculatedUntil: {
      type: String,
      default: null,
    },
    // Si true : quand on arrive à la dernière occurrence, elle repart automatiquement pour un cycle
    loop: {
      type: Boolean,
      default: false,
    },
    // Si false : cette projection est désactivée et ses occurrences ne s'affichent pas
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

ProjectionSchema.index({ accountId: 1 });
ProjectionSchema.index({ userId: 1 });
ProjectionSchema.index({ accountId: 1, active: 1 });

ProjectionSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Projection = mongoose.model("Projection", ProjectionSchema);
