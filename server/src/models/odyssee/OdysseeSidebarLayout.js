import mongoose from "mongoose";

import { odysseeConn } from "../../config/database.js";

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["category", "folder"], required: true },
    id: { type: String, required: true },
  },
  { _id: false },
);

const sidebarLayoutSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: {
    type: String,
    enum: ["catalog", "passengers", "odyssey"],
    required: true,
  },
  items: [itemSchema],
});

sidebarLayoutSchema.index({ userId: 1, type: 1 }, { unique: true });

export const OdysseeSidebarLayout = odysseeConn.model(
  "OdysseeSidebarLayout",
  sidebarLayoutSchema,
);
