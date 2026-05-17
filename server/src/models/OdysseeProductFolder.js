import mongoose from "mongoose";

const productFolderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OdysseeCategory",
    required: true,
  },
  parentFolderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OdysseeProductFolder",
    default: null,
  },
  name: { type: String, default: "", trim: true },
  color: { type: String, default: "#969696" },
  depth: { type: Number, enum: [0, 1], default: 0 },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

productFolderSchema.index({ userId: 1 });
productFolderSchema.index({ categoryId: 1 });
productFolderSchema.index({ userId: 1, categoryId: 1 });

export const OdysseeProductFolder = mongoose.model(
  "OdysseeProductFolder",
  productFolderSchema,
);
