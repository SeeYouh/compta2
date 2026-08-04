import express from "express";

import { authenticate } from "../../middleware/auth.js";
import {
  accountFromParam,
  requirePermission,
} from "../../middleware/requirePermission.js";
import {
  createAccountSchema,
  updateAccountSchema,
} from "../../schemas/synapse.js";
import { validate } from "../../middleware/validate.js";
import {
  createAccount,
  deleteAccount,
  getAllAccounts,
  getTemplateAccount,
  updateAccount,
  updateSharedPermission,
} from "../../controllers/synapse/accountsController.js";

const router = express.Router();

// GET /api/accounts - Récupère tous les comptes accessibles par l'utilisateur
router.get("/", authenticate, getAllAccounts);

// GET /api/accounts/template - Récupère le compte template
router.get("/template", getTemplateAccount);

// POST /api/accounts - Créer un nouveau compte
router.post("/", authenticate, validate(createAccountSchema), createAccount);

// PUT /api/accounts/:id - Modifier un compte
router.put(
  "/:id",
  authenticate,
  requirePermission("canRenameAccount", accountFromParam()),
  validate(updateAccountSchema),
  updateAccount,
);

// DELETE /api/accounts/:id - Supprimer un compte (destructif : propriétaire seul)
router.delete(
  "/:id",
  authenticate,
  requirePermission(null, accountFromParam(), { ownerOnly: true }),
  deleteAccount,
);

// PATCH /api/accounts/:id/shared-permissions - Modifier une permission d'un partagé
router.patch(
  "/:id/shared-permissions",
  authenticate,
  requirePermission(null, accountFromParam(), { ownerOnly: true }),
  updateSharedPermission,
);

export default router;
