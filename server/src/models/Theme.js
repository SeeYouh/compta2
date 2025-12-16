import mongoose from "mongoose";

const SubThemeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const ThemeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    subThemes: {
      type: Map,
      of: SubThemeSchema,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Utiliser l'id personnalisé comme clé primaire
ThemeSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    // Convertir la Map subThemes en objet simple
    if (ret.subThemes && ret.subThemes instanceof Map) {
      ret.subThemes = Object.fromEntries(ret.subThemes);
    }
    return ret;
  },
});

export const Theme = mongoose.model("Theme", ThemeSchema);
