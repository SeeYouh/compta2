import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const UserSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => `user-${uuidv4()}`,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpires: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetTokenExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash du mot de passe avant sauvegarde
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Transformation JSON (ne pas exposer le password)
UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.model("User", UserSchema);
