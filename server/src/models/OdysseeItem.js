import mongoose from "mongoose";

import { odysseeConn } from "../config/database.js";

const odysseeItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  img: {
    type: [String],
    default: [],
  },
  tooltips: {
    type: String,
  },
  contentFilesData: {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    aliasName: {
      activate: {
        type: Boolean,
        default: true,
      },
      name: {
        type: String,
      },
    },
    img: [
      {
        adress: { type: String },
        alt: { type: String },
      },
    ],
    treatmentDuration: { type: Number },
    amountToAdminister: { type: Number },
    intakeTime: {
      mode: {
        type: String,
        enum: ["normal", "advanced"],
        default: "normal",
      },
      checkedMoments: {
        type: [String],
        default: [],
      },
      selectedTime: { type: String },
      durationBefore: { type: Number },
      durationAfter: { type: Number },
      nightDuration: { type: Number },
      advancedMode: {
        type: Boolean,
        default: false,
      },
      daysTime: [
        {
          name: { type: String, required: true },
          activateTime: { type: Boolean, default: false },
        },
      ],
    },
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OdysseeCategory",
    required: true,
  },
  color: {
    type: String,
    default: "",
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OdysseeTemplate",
    default: null,
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OdysseeProductFolder",
    default: null,
  },
  rootOrder: {
    type: Number,
    default: null,
  },
  userId: {
    type: String,
    required: true,
  },
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

odysseeItemSchema.index({
  "contentFilesData.productName": "text",
  "contentFilesData.aliasName.name": "text",
  name: "text",
});
odysseeItemSchema.index({ userId: 1 });
odysseeItemSchema.index({ categoryId: 1 });
odysseeItemSchema.index({ userId: 1, categoryId: 1 });

odysseeItemSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

odysseeItemSchema.statics.findByUser = function (userId) {
  return this.find({ userId, isActive: true, deletedAt: null });
};

odysseeItemSchema.statics.findByUserAndCategory = function (
  userId,
  categoryId,
) {
  return this.find({ userId, categoryId, isActive: true, deletedAt: null });
};

odysseeItemSchema.statics.searchItems = function (searchTerm, userId) {
  return this.find({
    userId,
    isActive: true,
    deletedAt: null,
    $text: { $search: searchTerm },
  });
};

// 3e argument : nom de collection explicite — les données existantes vivent dans
// "odysseyitems" (pluralisation de l'ancien nom de modèle "OdysseyItem")
export const OdysseeItem = odysseeConn.model(
  "OdysseeItem",
  odysseeItemSchema,
  "odysseyitems",
);
