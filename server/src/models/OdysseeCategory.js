import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    default: null,
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

// Unicité du nom par utilisateur
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

categorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const OdysseeCategory = mongoose.model(
  "OdysseeCategory",
  categorySchema,
);
