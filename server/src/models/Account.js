import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const AccountSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => `account-${uuidv4()}`,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: "#3b82f6",
      match: /^#[A-Fa-f0-9]{6}$/,
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
      required: false, // Optionnel pour compatibilité avec données existantes
      default: null,
    },
    sharedWith: {
      type: [
        {
          userId: {
            type: String,
            required: true,
          },
          permissions: {
            type: {
              canViewTransactions: { type: Boolean, default: false },
              canCreateTransactions: { type: Boolean, default: false },
              canEditTransactions: { type: Boolean, default: false },
              canDeleteTransactions: { type: Boolean, default: false },
              canManageThemes: { type: Boolean, default: false },
              canRenameAccount: { type: Boolean, default: false },
              canInviteUsers: { type: Boolean, default: false },
            },
            default: {},
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index pour recherche rapide
AccountSchema.index({ isTemplate: 1 });
AccountSchema.index({ userId: 1 });
AccountSchema.index({ "sharedWith.userId": 1 });

// Transformation JSON
AccountSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Account = mongoose.model("Account", AccountSchema);
