import { checkAccountAccess } from "./permissions.js";
import { detail, detailFields } from "../utils/errorDetail.js";
import { Transaction } from "../models/synapse/Transaction.js";

/**
 * Garde d'autorisation par compte.
 *
 * `checkAccountAccess` produisait déjà des permissions fines
 * (canEditTransactions, canDeleteTransactions, canManageThemes…) mais AUCUNE
 * n'était jamais consultée : la distinction reader / editor était décorative.
 * Ce middleware est le point unique où elles deviennent effectives.
 *
 * @param {string|null} permission  drapeau requis, ou `null` pour n'exiger que l'accès
 * @param {(req) => Promise<string|null>} resolveAccountId  d'où vient l'identifiant de compte
 * @param {{ ownerOnly?: boolean }} [options]
 */
export const requirePermission =
  (permission, resolveAccountId, options = {}) =>
  async (req, res, next) => {
    try {
      const accountId = await resolveAccountId(req);

      // Ressource inexistante : 404 explicite, sans révéler si elle appartient à autrui.
      if (!accountId) {
        return res.status(404).json({ error: "Ressource introuvable" });
      }

      const { hasAccess, isOwner, permissions } = await checkAccountAccess(
        req.userId,
        accountId,
      );

      if (!hasAccess) {
        return res.status(403).json({
          error: detail(
            `Accès refusé : le compte ${accountId} ne vous est pas accessible`,
            "Accès refusé",
          ),
          ...detailFields({ accountId, userId: req.userId }),
        });
      }

      if (options.ownerOnly && !isOwner) {
        return res.status(403).json({
          error: detail(
            `Accès refusé : action réservée au propriétaire du compte ${accountId}`,
            "Accès refusé",
          ),
          ...detailFields({ accountId, requis: "propriétaire" }),
        });
      }

      if (permission && !permissions?.[permission]) {
        return res.status(403).json({
          error: detail(
            `Accès refusé : permission « ${permission} » requise sur le compte ${accountId}`,
            "Accès refusé",
          ),
          ...detailFields({
            accountId,
            permissionRequise: permission,
            permissionsAccordees: permissions,
          }),
        });
      }

      // Mis à disposition des contrôleurs, qui n'ont plus à refaire la résolution.
      req.accountId = accountId;
      req.accountPermissions = permissions;
      req.isAccountOwner = isOwner;

      next();
    } catch (error) {
      next(error);
    }
  };

// ─── Résolveurs d'identifiant de compte ──────────────────────────────────────

/** L'identifiant de route EST le compte (ex. /accounts/:id). */
export const accountFromParam =
  (param = "id") =>
  (req) =>
    req.params[param] ?? null;

/** Le compte vient du corps de la requête (ex. création de transaction). */
export const accountFromBody =
  (field = "accountId") =>
  (req) =>
    req.body?.[field] ?? null;

/**
 * Le compte se déduit du thème visé (ex. /themes/:themeId).
 * Si le thème n'existe pas encore (upsert), on retombe sur l'accountId du corps —
 * qui sera lui aussi vérifié, puisque c'est ce résolveur qui alimente la garde.
 */
export const accountFromTheme =
  (param = "themeId") =>
  async (req) => {
    const { Theme } = await import("../models/synapse/Theme.js");
    const theme = await Theme.findOne({ id: req.params[param] }).select(
      "accountId",
    );
    return theme?.accountId ?? req.body?.accountId ?? null;
  };

/** Le compte se déduit de la transaction visée (ex. /transactions/:id). */
export const accountFromTransaction =
  (param = "id") =>
  async (req) => {
    const transaction = await Transaction.findOne({
      id: req.params[param],
    }).select("accountId");
    return transaction?.accountId ?? null;
  };
