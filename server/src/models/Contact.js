import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const ContactSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => `contact-${uuidv4()}`,
    },
    ownerId: {
      type: String,
      required: true, // userId de la personne qui gère ce contact
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

ContactSchema.index({ ownerId: 1 });
ContactSchema.index({ ownerId: 1, email: 1 }, { unique: true });

ContactSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Contact = mongoose.model("Contact", ContactSchema);
