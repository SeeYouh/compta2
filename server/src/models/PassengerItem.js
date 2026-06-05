import mongoose from "mongoose";

import { odysseeConn } from "../config/database.js";

const passengerItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  tooltips: {
    type: String,
  },
  contentFilesData: {
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    aliasName: {
      activate: { type: Boolean, default: false },
      name: { type: String, default: "" },
    },
    gender: { type: String, enum: ["F", "M", "NC"], default: "NC" },
    birthDate: { type: String, default: null },
    avatar: { type: String, default: null },
    contact: {
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      socialNetworks: [
        {
          network: { type: String },
          value: { type: String },
        },
      ],
    },
    address: {
      country: { type: String, default: "FR" },
      postalCode: { type: String, default: "" },
      city: { type: String, default: "" },
      address: { type: String, default: "" },
      addressComplement: { type: String, default: "" },
    },
    infoSupp: [
      {
        id: { type: String },
        type: { type: String, enum: ["block", "folder"], default: "block" },
        title: { type: String },
        color: { type: String, default: "#969696" },
        content: { type: String },
        order: { type: Number },
        categoryIds: [{ type: String }],
        isOpen: { type: Boolean, default: false },
      },
    ],
    infoSuppLayout: [{ type: mongoose.Schema.Types.Mixed }],
    infoSuppFolders: [{ type: mongoose.Schema.Types.Mixed }],
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
  color: { type: String, default: "#969696" },
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

passengerItemSchema.index({
  "contentFilesData.firstName": "text",
  "contentFilesData.lastName": "text",
  name: "text",
});
passengerItemSchema.index({ userId: 1 });
passengerItemSchema.index({ categoryId: 1 });
passengerItemSchema.index({ userId: 1, categoryId: 1 });

passengerItemSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

passengerItemSchema.statics.findByUser = function (userId) {
  return this.find({ userId, isActive: true, deletedAt: null });
};

passengerItemSchema.statics.findByUserAndCategory = function (
  userId,
  categoryId,
) {
  return this.find({ userId, categoryId, isActive: true, deletedAt: null });
};

passengerItemSchema.statics.searchItems = function (searchTerm, userId) {
  return this.find({
    userId,
    isActive: true,
    deletedAt: null,
    $text: { $search: searchTerm },
  });
};

export const PassengerItem = odysseeConn.model(
  "PassengerItem",
  passengerItemSchema,
);
