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
    isTemplate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour recherche rapide
AccountSchema.index({ isTemplate: 1 });

// Transformation JSON
AccountSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Account = mongoose.model("Account", AccountSchema);
