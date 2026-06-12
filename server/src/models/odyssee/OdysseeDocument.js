import mongoose from "mongoose";

import { odysseeConn } from "../../config/database.js";

// Un document = un template + des données réelles liées (bindings)
const odysseeDocumentSchema = new mongoose.Schema({
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

  // Template utilisé comme base
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OdysseeTemplate",
    required: true,
  },

  // Liaisons : chaque binding associe un emplacement de bloc à une instance réelle
  // 1 passager max, N produits
  bindings: [
    {
      pageIndex: { type: Number, required: true },
      blockPlacementIndex: { type: Number, required: true },
      sourceType: {
        type: String,
        enum: ["passenger", "product"],
        required: true,
      },
      // ObjectId vers PassengerItem ou OdysseeProduct
      sourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
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

odysseeDocumentSchema.index({ userId: 1 });
odysseeDocumentSchema.index({ categoryId: 1 });
odysseeDocumentSchema.index({ userId: 1, categoryId: 1 });
odysseeDocumentSchema.index({ templateId: 1 });
odysseeDocumentSchema.index({
  productName: "text",
  "aliasName.name": "text",
  name: "text",
});

odysseeDocumentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const OdysseeDocument = odysseeConn.model(
  "OdysseeDocument",
  odysseeDocumentSchema,
);
