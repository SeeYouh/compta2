import mongoose from "mongoose";

import { odysseeConn } from "../../config/database.js";

// Un template définit la mise en page (où les blocs sont placés sur les pages)
// mais ne contient aucune donnée réelle
const odysseeTemplateSchema = new mongoose.Schema({
  // Champs item Odyssée (même convention que les autres items)
  name: {
    type: String,
    required: true,
    trim: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  aliasName: {
    activate: { type: Boolean, default: false },
    name: { type: String, default: "" },
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OdysseeCategory",
    required: true,
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OdysseeProductFolder",
    default: null,
  },
  userId: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "#969696",
  },
  rootOrder: {
    type: Number,
    default: null,
  },

  // Marges en mm — niveau document, identiques sur toutes les pages
  margins: {
    top: { type: Number, default: 10 },
    bottom: { type: Number, default: 10 },
    left: { type: Number, default: 10 },
    right: { type: Number, default: 10 },
  },

  // Pages — chaque page a sa propre grille indépendante
  pages: [
    {
      columns: { type: Number, required: true, min: 2 },
      rows: { type: Number, required: true, min: 2 },
      // Blocs positionnés sur cette page
      blocks: [
        {
          blockId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OdysseeBlock",
            required: true,
          },
          colStart: { type: Number, required: true },
          rowStart: { type: Number, required: true },
          colSpan: { type: Number, default: 1 },
          rowSpan: { type: Number, default: 1 },
        },
      ],
    },
  ],

  isActive: {
    type: Boolean,
    default: true,
  },
  deletedAt: {
    type: Date,
    default: null,
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

odysseeTemplateSchema.index({ userId: 1 });
odysseeTemplateSchema.index({ categoryId: 1 });
odysseeTemplateSchema.index({ userId: 1, categoryId: 1 });
odysseeTemplateSchema.index({
  productName: "text",
  "aliasName.name": "text",
  name: "text",
});

odysseeTemplateSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const OdysseeTemplate = odysseeConn.model(
  "OdysseeTemplate",
  odysseeTemplateSchema,
);
