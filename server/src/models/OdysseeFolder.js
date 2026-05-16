import mongoose from "mongoose";

const folderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  isOpen: { type: Boolean, default: false },
  categoryIds: [{ type: String }],
  color: { type: String, default: "#969696" },
  name: { type: String, default: "" },
});

folderSchema.index({ userId: 1 });

export const OdysseeFolder = mongoose.model("OdysseeFolder", folderSchema);
