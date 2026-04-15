import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

/**
 * Rôles prédéfinis pour le partage de compte.
 * Lecteur  : consultation uniquement
 * Éditeur  : consultation + création + modification (pas de suppression ni admin)
 */
export const SHARING_ROLES = {
  reader: {
    label: "Lecteur",
    permissions: {
      canViewTransactions: true,
      canCreateTransactions: false,
      canEditTransactions: false,
      canDeleteTransactions: false,
      canManageThemes: false,
      canRenameAccount: false,
      canInviteUsers: false,
    },
  },
  editor: {
    label: "Éditeur",
    permissions: {
      canViewTransactions: true,
      canCreateTransactions: true,
      canEditTransactions: true,
      canDeleteTransactions: false,
      canManageThemes: false,
      canRenameAccount: false,
      canInviteUsers: false,
    },
  },
};

const AccountInvitationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => `inv-${uuidv4()}`,
    },
    accountId: {
      type: String,
      required: true,
    },
    invitedBy: {
      type: String, // userId du propriétaire
      required: true,
    },
    invitedEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["reader", "editor"],
      required: true,
      default: "editor",
    },
    token: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "revoked"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

AccountInvitationSchema.index({ accountId: 1 });
AccountInvitationSchema.index({ invitedEmail: 1 });
AccountInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-cleanup

export const AccountInvitation = mongoose.model(
  "AccountInvitation",
  AccountInvitationSchema,
);
