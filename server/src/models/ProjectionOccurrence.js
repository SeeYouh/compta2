import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

/**
 * Une occurrence unique d'une projection (ex: Samsic Intérim du 05/05/2026).
 * Ces occurrences s'affichent dans la liste des mouvements côté front
 * quand les projections sont activées.
 */
const ProjectionOccurrenceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => `pocc-${uuidv4()}`,
    },
    projectionId: {
      type: String,
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    // Date au format DD/MM/YYYY pour cohérence avec Transaction
    date: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
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
  },
  {
    timestamps: false,
  },
);

ProjectionOccurrenceSchema.index({ projectionId: 1 });
ProjectionOccurrenceSchema.index({ accountId: 1 });
ProjectionOccurrenceSchema.index({ date: 1 });

ProjectionOccurrenceSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ProjectionOccurrence = mongoose.model(
  "ProjectionOccurrence",
  ProjectionOccurrenceSchema,
);
