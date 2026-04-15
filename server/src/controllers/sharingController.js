import { v4 as uuidv4 } from "uuid";

import { Account } from "../models/Account.js";
import {
  AccountInvitation,
  SHARING_ROLES,
} from "../models/AccountInvitation.js";
import { checkAccountAccess } from "../middleware/permissions.js";
import {
  sendInvitationEmail,
  sendInvitationToNewUserEmail,
} from "../config/email.js";
import { User } from "../models/User.js";

// POST /api/sharing/:accountId/invite
export const inviteUser = async (req, res) => {
  const { accountId } = req.params;
  const { email, role } = req.body;
  const userId = req.userId;

  if (!email || !role) {
    return res.status(400).json({ message: "Email et rôle requis" });
  }

  if (!["reader", "editor"].includes(role)) {
    return res
      .status(400)
      .json({ message: "Rôle invalide. Valeurs acceptées : reader, editor" });
  }

  const { hasAccess, isOwner, account } = await checkAccountAccess(
    userId,
    accountId,
  );

  if (!hasAccess) {
    return res.status(404).json({ message: "Compte introuvable" });
  }

  if (!isOwner) {
    return res
      .status(403)
      .json({ message: "Seul le propriétaire peut inviter des membres" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Empêcher de s'inviter soi-même
  const owner = await User.findOne({ id: userId });
  if (owner && owner.email === normalizedEmail) {
    return res
      .status(400)
      .json({ message: "Vous ne pouvez pas vous inviter vous-même" });
  }

  // Vérifier qu'une invitation pending n'existe pas déjà
  const existingInvitation = await AccountInvitation.findOne({
    accountId,
    invitedEmail: normalizedEmail,
    status: "pending",
  });

  if (existingInvitation) {
    return res
      .status(409)
      .json({ message: "Une invitation est déjà en attente pour cet email" });
  }

  const invitedUser = await User.findOne({ email: normalizedEmail });

  // Vérifier si déjà membre (par userId si user existant)
  if (
    invitedUser &&
    account.sharedWith?.some((s) => s.userId === invitedUser.id)
  ) {
    return res
      .status(409)
      .json({ message: "Cet utilisateur est déjà membre du compte" });
  }

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

  await AccountInvitation.create({
    accountId,
    invitedBy: userId,
    invitedEmail: normalizedEmail,
    role,
    token,
    expiresAt,
  });

  if (invitedUser) {
    await sendInvitationEmail(
      normalizedEmail,
      owner.name,
      account.name,
      role,
      token,
    );
  } else {
    await sendInvitationToNewUserEmail(
      normalizedEmail,
      owner.name,
      account.name,
      role,
      token,
    );
  }

  return res.status(201).json({ message: "Invitation envoyée" });
};

// POST /api/sharing/invitations/:token/accept
export const acceptInvitation = async (req, res) => {
  const { token } = req.params;
  const userId = req.userId;

  const invitation = await AccountInvitation.findOne({
    token,
    status: "pending",
  });

  if (!invitation) {
    return res
      .status(404)
      .json({ message: "Invitation introuvable ou déjà traitée" });
  }

  if (new Date() > invitation.expiresAt) {
    return res.status(410).json({ message: "Cette invitation a expiré" });
  }

  const user = await User.findOne({ id: userId });
  if (!user || user.email !== invitation.invitedEmail) {
    return res
      .status(403)
      .json({ message: "Cette invitation ne vous est pas destinée" });
  }

  const account = await Account.findOne({ id: invitation.accountId });
  if (!account) {
    invitation.status = "revoked";
    await invitation.save();
    return res
      .status(404)
      .json({ message: "Le compte associé à cette invitation n'existe plus" });
  }

  // Éviter les doublons
  const alreadyMember = account.sharedWith?.some((s) => s.userId === userId);
  if (alreadyMember) {
    invitation.status = "accepted";
    await invitation.save();
    return res
      .status(200)
      .json({ message: "Vous êtes déjà membre de ce compte" });
  }

  const permissions =
    SHARING_ROLES[invitation.role]?.permissions ??
    SHARING_ROLES.reader.permissions;

  account.sharedWith = account.sharedWith ?? [];
  account.sharedWith.push({ userId, permissions });
  await account.save();

  invitation.status = "accepted";
  await invitation.save();

  return res.status(200).json({ message: "Invitation acceptée" });
};

// POST /api/sharing/invitations/:token/decline
export const declineInvitation = async (req, res) => {
  const { token } = req.params;
  const userId = req.userId;

  const invitation = await AccountInvitation.findOne({
    token,
    status: "pending",
  });

  if (!invitation) {
    return res
      .status(404)
      .json({ message: "Invitation introuvable ou déjà traitée" });
  }

  const user = await User.findOne({ id: userId });
  if (!user || user.email !== invitation.invitedEmail) {
    return res
      .status(403)
      .json({ message: "Cette invitation ne vous est pas destinée" });
  }

  invitation.status = "declined";
  await invitation.save();

  return res.status(200).json({ message: "Invitation refusée" });
};

// GET /api/sharing/:accountId/members
export const getMembers = async (req, res) => {
  const { accountId } = req.params;
  const userId = req.userId;

  const { hasAccess, account, isOwner } = await checkAccountAccess(
    userId,
    accountId,
  );

  if (!hasAccess) {
    return res.status(404).json({ message: "Compte introuvable" });
  }

  const members = await Promise.all(
    (account.sharedWith ?? []).map(async (s) => {
      const user = await User.findOne({ id: s.userId }).select("id name email");
      return {
        userId: s.userId,
        name: user?.name ?? "Utilisateur inconnu",
        email: user?.email ?? "",
        permissions: s.permissions,
        role: resolveRoleFromPermissions(s.permissions),
      };
    }),
  );

  const pendingInvitations = isOwner
    ? await AccountInvitation.find({ accountId, status: "pending" }).select(
        "invitedEmail role expiresAt token",
      )
    : [];

  return res.status(200).json({ members, pendingInvitations });
};

// PATCH /api/sharing/:accountId/members/:memberId
export const updateMemberRole = async (req, res) => {
  const { accountId, memberId } = req.params;
  const { role } = req.body;
  const userId = req.userId;

  if (!["reader", "editor"].includes(role)) {
    return res.status(400).json({ message: "Rôle invalide" });
  }

  const { hasAccess, isOwner, account } = await checkAccountAccess(
    userId,
    accountId,
  );

  if (!hasAccess) {
    return res.status(404).json({ message: "Compte introuvable" });
  }

  if (!isOwner) {
    return res
      .status(403)
      .json({ message: "Seul le propriétaire peut modifier les rôles" });
  }

  const member = account.sharedWith?.find((s) => s.userId === memberId);
  if (!member) {
    return res.status(404).json({ message: "Membre introuvable" });
  }

  member.permissions = SHARING_ROLES[role].permissions;
  account.markModified("sharedWith");
  await account.save();

  return res.status(200).json({ message: "Rôle mis à jour" });
};

// DELETE /api/sharing/:accountId/members/:memberId
export const removeMember = async (req, res) => {
  const { accountId, memberId } = req.params;
  const userId = req.userId;

  const { hasAccess, isOwner, account } = await checkAccountAccess(
    userId,
    accountId,
  );

  if (!hasAccess) {
    return res.status(404).json({ message: "Compte introuvable" });
  }

  // Le propriétaire peut retirer n'importe qui ; un membre peut se retirer lui-même
  if (!isOwner && memberId !== userId) {
    return res.status(403).json({ message: "Action non autorisée" });
  }

  const initialLength = account.sharedWith?.length ?? 0;
  account.sharedWith = (account.sharedWith ?? []).filter(
    (s) => s.userId !== memberId,
  );

  if (account.sharedWith.length === initialLength) {
    return res.status(404).json({ message: "Membre introuvable" });
  }

  await account.save();

  return res.status(200).json({ message: "Membre retiré" });
};

// GET /api/sharing/invitations/pending
export const getPendingInvitations = async (req, res) => {
  const userId = req.userId;
  const user = await User.findOne({ id: userId });

  if (!user) {
    return res.status(404).json({ message: "Utilisateur introuvable" });
  }

  const invitations = await AccountInvitation.find({
    invitedEmail: user.email,
    status: "pending",
    expiresAt: { $gt: new Date() },
  }).select("accountId role token expiresAt invitedBy");

  const enriched = await Promise.all(
    invitations.map(async (inv) => {
      const account = await Account.findOne({ id: inv.accountId }).select(
        "id name",
      );
      const inviter = await User.findOne({ id: inv.invitedBy }).select(
        "name email",
      );
      return {
        token: inv.token,
        role: inv.role,
        expiresAt: inv.expiresAt,
        account: account ? { id: account.id, name: account.name } : null,
        invitedBy: inviter
          ? { name: inviter.name, email: inviter.email }
          : null,
      };
    }),
  );

  return res.status(200).json({ invitations: enriched });
};

// DELETE /api/sharing/:accountId/invitations/:token (révoquer une invitation pending)
export const revokeInvitation = async (req, res) => {
  const { accountId, token } = req.params;
  const userId = req.userId;

  const { hasAccess, isOwner } = await checkAccountAccess(userId, accountId);

  if (!hasAccess) {
    return res.status(404).json({ message: "Compte introuvable" });
  }

  if (!isOwner) {
    return res
      .status(403)
      .json({ message: "Seul le propriétaire peut révoquer une invitation" });
  }

  const invitation = await AccountInvitation.findOne({
    token,
    accountId,
    status: "pending",
  });
  if (!invitation) {
    return res.status(404).json({ message: "Invitation introuvable" });
  }

  invitation.status = "revoked";
  await invitation.save();

  return res.status(200).json({ message: "Invitation révoquée" });
};

// Utilitaire : déduire le rôle à partir des permissions stockées
function resolveRoleFromPermissions(permissions) {
  if (!permissions) return "reader";
  if (permissions.canCreateTransactions && permissions.canEditTransactions)
    return "editor";
  return "reader";
}
