import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const NodeDataSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Nouveau nœud" },
    color: { type: String, default: "#ffffff" },
    childCanvasId: { type: String, default: null },
    width: { type: Number, default: 150 },
    height: { type: Number, default: 150 },
  },
  { _id: false },
);

const NodeStyleSchema = new mongoose.Schema(
  {
    width: { type: Number, default: 150 },
    height: { type: Number, default: 150 },
  },
  { _id: false },
);

const OrgNodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, default: "customNode" },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    data: { type: NodeDataSchema, default: () => ({}) },
    style: { type: NodeStyleSchema, default: () => ({}) },
  },
  { _id: false },
);

const OrgEdgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    type: { type: String, default: "default" },
  },
  { _id: false },
);

const ViewportSchema = new mongoose.Schema(
  {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    zoom: { type: Number, default: 1 },
  },
  { _id: false },
);

const OrgCanvasSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    userId: {
      type: String,
      required: true,
    },
    parentNodeId: {
      type: String,
      default: null,
    },
    nodes: { type: [OrgNodeSchema], default: [] },
    edges: { type: [OrgEdgeSchema], default: [] },
    viewport: { type: ViewportSchema, default: () => ({}) },
  },
  { timestamps: true },
);

OrgCanvasSchema.index({ userId: 1 });
OrgCanvasSchema.index({ id: 1, userId: 1 }, { unique: true });

OrgCanvasSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

export const OrgCanvas = mongoose.model("OrgCanvas", OrgCanvasSchema);
