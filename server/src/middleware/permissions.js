import { Account } from "../models/Account.js";

/**
 * Vérifie si un utilisateur a accès à un compte
 * @param {string} userId - ID de l'utilisateur
 * @param {string} accountId - ID du compte
 * @returns {Promise<{hasAccess: boolean, account: object|null, isOwner: boolean, permissions: object|null}>}
 */
export async function checkAccountAccess(userId, accountId) {
  const account = await Account.findOne({ id: accountId });

  if (!account) {
    return {
      hasAccess: false,
      account: null,
      isOwner: false,
      permissions: null,
    };
  }

  // Compte template : accessible à tous
  if (account.isTemplate) {
    return {
      hasAccess: true,
      account,
      isOwner: false,
      permissions: { readOnly: true },
    };
  }

  // Propriétaire du compte
  if (account.userId === userId) {
    return {
      hasAccess: true,
      account,
      isOwner: true,
      permissions: {
        canViewTransactions: true,
        canCreateTransactions: true,
        canEditTransactions: true,
        canDeleteTransactions: true,
        canManageThemes: true,
        canRenameAccount: true,
        canInviteUsers: true,
      },
    };
  }

  // Utilisateur invité
  const sharedUser = account.sharedWith?.find((s) => s.userId === userId);
  if (sharedUser) {
    return {
      hasAccess: true,
      account,
      isOwner: false,
      permissions: sharedUser.permissions || {},
    };
  }

  return { hasAccess: false, account: null, isOwner: false, permissions: null };
}

/**
 * Récupère tous les comptes accessibles par un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>}
 */
export async function getUserAccounts(userId) {
  // Comptes où l'utilisateur est propriétaire ou invité
  const accounts = await Account.find({
    $or: [{ userId }, { "sharedWith.userId": userId }],
    isTemplate: false,
  }).sort({ createdAt: 1 });

  return accounts;
}
