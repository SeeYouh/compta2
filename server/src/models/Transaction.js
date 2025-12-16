import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: String,
      required: true,
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
    disabled: {
      type: Boolean,
      default: false,
    },
    updatedAt: {
      type: Number,
    },
  },
  {
    timestamps: false,
  }
);

// Index pour améliorer les performances des requêtes
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ themeId: 1 });
TransactionSchema.index({ disabled: 1 });

// Méthode pour formater les données avant envoi au client
TransactionSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Transaction = mongoose.model("Transaction", TransactionSchema);
