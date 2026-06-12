import mongoose from "mongoose";

import { odysseeConn } from "../config/database.js";

// Une Rubrique est un bloc composite nommé : regroupement de champs issus de
// fieldDefinitions.js, positionnés sur une grille interne.
// Réutilisable dans plusieurs Templates.
const odysseeBlockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // "passenger" ou "catalogue"
  sourceType: {
    type: String,
    enum: ["passenger", "catalogue"],
    required: true,
  },
  // Dimensions de la grille interne
  columns: {
    type: Number,
    required: true,
    min: 1,
  },
  rows: {
    type: Number,
    required: true,
    min: 1,
  },
  // Champs positionnés sur la grille — fieldId fait référence à PASSENGER_FIELDS ou CATALOGUE_FIELDS
  fieldPlacements: [
    {
      fieldId:  { type: String, required: true },
      colStart: { type: Number, required: true },
      rowStart: { type: Number, required: true },
      colSpan:  { type: Number, default: 1 },
      rowSpan:  { type: Number, default: 1 },
      // Mise en forme propre à ce champ — fontFamily référence un id de FONT_DEFINITIONS (client)
      style: {
        textAlign:      { type: String, enum: ["left", "center", "right"], default: "left" },
        fontWeight:     { type: String, enum: ["normal", "bold"], default: "normal" },
        textDecoration: { type: String, enum: ["none", "underline"], default: "none" },
        fontFamily:     { type: String, default: "inter" },
      },
    },
  ],
  // null = rubrique globale (fournie par l'app), sinon propre à l'utilisateur
  userId: {
    type: String,
    default: null,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

odysseeBlockSchema.index({ userId: 1 });
odysseeBlockSchema.index({ sourceType: 1 });
odysseeBlockSchema.index({ isDefault: 1 });

odysseeBlockSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const OdysseeBlock = odysseeConn.model(
  "OdysseeBlock",
  odysseeBlockSchema,
);
