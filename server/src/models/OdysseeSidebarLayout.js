import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["category", "folder"], required: true },
    id: { type: String, required: true },
  },
  { _id: false },
);

const sidebarLayoutSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [itemSchema],
});

export const OdysseeSidebarLayout = mongoose.model(
  "OdysseeSidebarLayout",
  sidebarLayoutSchema,
);
