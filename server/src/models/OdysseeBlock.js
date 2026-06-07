import mongoose from "mongoose";

import { odysseeConn } from "../config/database.js";

// Un bloc définit quels champs afficher ET comment les disposer (grille interne en fr)
const odysseeBlockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // "passenger" ou "product"
  sourceType: {
    type: String,
    enum: ["passenger", "product"],
    required: true,
  },
  // Grille interne du bloc (proportions en fr)
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
  // Champs à afficher, positionnés dans la grille interne
  fields: [
    {
      key: { type: String, required: true }, // ex: "firstName", "address.city", "avatar"
      label: { type: String, default: "" },
      colStart: { type: Number, required: true },
      rowStart: { type: Number, required: true },
      colSpan: { type: Number, default: 1 },
      rowSpan: { type: Number, default: 1 },
    },
  ],
  // null = bloc global (fourni par l'app), sinon propre à l'utilisateur
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
