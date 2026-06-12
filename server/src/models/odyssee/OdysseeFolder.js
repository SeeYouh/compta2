import mongoose from "mongoose";

import { odysseeConn } from "../../config/database.js";

const folderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: {
    type: String,
    enum: ["catalog", "passengers", "odyssey"],
    required: true,
  },
  isOpen: { type: Boolean, default: false },
  categoryIds: [{ type: String }],
  color: { type: String, default: "#969696" },
  name: { type: String, default: "" },
});

folderSchema.index({ userId: 1, type: 1 });

export const OdysseeFolder = odysseeConn.model("OdysseeFolder", folderSchema);
